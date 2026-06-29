import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { IStepsCardioType } from "@/interfaces/Workout";
import useStepsData, { UseStepsDataResult } from "@/hooks/api/useStepsData";
import useStepsNotifications, {
  UseStepsNotificationsResult,
} from "@/hooks/api/useStepsNotifications";
import useLiveStepsActivity from "@/hooks/api/useLiveStepsActivity";
import { useStepsProgressApi } from "@/hooks/api/useStepsProgressApi";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import { buildGoalsByDay, getLocalDateKey, stepsToDistanceKm } from "@/utils/stepsUtils";

interface StepsTrackingContextValue {
  steps: UseStepsDataResult;
  notifications: UseStepsNotificationsResult;
  refreshSteps: () => Promise<void>;
}

const StepsTrackingContext = createContext<StepsTrackingContextValue | null>(null);

const HEALTH_REFRESH_INTERVAL_MS = 15 * 1000;
const SERVER_SYNC_INTERVAL_MS = 15 * 60 * 1000;

export const StepsTrackingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const steps = useStepsData();
  const notifications = useStepsNotifications();
  const {
    activityId: liveStepsActivityId,
    isAvailable: isLiveStepsAvailable,
    isEnabled: isLiveStepsEnabled,
    start: startLiveSteps,
    stop: stopLiveSteps,
    update: updateLiveSteps,
  } = useLiveStepsActivity();
  const { syncStepsProgress } = useStepsProgressApi();
  const { data: workoutPlan } = useWorkoutPlanQuery();

  const lastServerSyncAtRef = useRef(0);
  const lastServerSyncPayloadRef = useRef<string | null>(null);
  const lastLiveStepsPayloadRef = useRef<string | null>(null);
  const syncedAfterOpenRef = useRef(false);

  const stepsPlan = useMemo(() => {
    if (workoutPlan?.cardio?.type !== "steps") return undefined;
    return workoutPlan.cardio.plan as IStepsCardioType;
  }, [workoutPlan?.cardio]);

  const dailyGoal = useMemo(() => {
    const todayIndex = new Date().getDay();
    return buildGoalsByDay(stepsPlan)[todayIndex];
  }, [stepsPlan]);

  const canUseNativeSteps = steps.isNativeAvailable && steps.status === "granted";
  const isStepsTrackingEnabled = workoutPlan?.cardio?.type === "steps";

  const syncCurrentSteps = useCallback(
    async (force = false) => {
      if (!isStepsTrackingEnabled || !canUseNativeSteps || !steps.syncedAt) return;

      const now = Date.now();
      if (!force && now - lastServerSyncAtRef.current < SERVER_SYNC_INTERVAL_MS) return;

      const date = getLocalDateKey(new Date());
      const source = Platform.OS === "ios" ? "healthkit" : "health_connect";
      const payloadKey = `${date}:${steps.todaySteps}:${steps.todayCalories}:${dailyGoal}:${source}`;
      if (!force && lastServerSyncPayloadRef.current === payloadKey) return;

      try {
        await syncStepsProgress({
          date,
          steps: steps.todaySteps,
          calories: steps.todayCalories,
          distanceKm: stepsToDistanceKm(steps.todaySteps, 2),
          dailyGoal,
          source,
        });
        lastServerSyncAtRef.current = now;
        lastServerSyncPayloadRef.current = payloadKey;
      } catch (err) {
        console.error("[steps] failed to sync steps progress:", err);
      }
    },
    [
      canUseNativeSteps,
      dailyGoal,
      isStepsTrackingEnabled,
      steps.syncedAt,
      steps.todayCalories,
      steps.todaySteps,
      syncStepsProgress,
    ]
  );

  const refreshSteps = useCallback(async () => {
    if (!canUseNativeSteps) return;
    await steps.refresh();
  }, [canUseNativeSteps, steps.refresh]);

  useEffect(() => {
    if (!canUseNativeSteps) return;

    const intervalId = setInterval(() => {
      steps.refresh();
    }, HEALTH_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [canUseNativeSteps, steps.refresh]);

  useEffect(() => {
    if (!canUseNativeSteps) return;

    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        steps.refresh();
      }
    });

    return () => subscription.remove();
  }, [canUseNativeSteps, steps.refresh]);

  useEffect(() => {
    if (!isStepsTrackingEnabled || !canUseNativeSteps || !steps.syncedAt) return;

    const force = !syncedAfterOpenRef.current;
    syncedAfterOpenRef.current = true;
    syncCurrentSteps(force);
  }, [canUseNativeSteps, isStepsTrackingEnabled, steps.syncedAt, syncCurrentSteps]);

  useEffect(() => {
    if (!isLiveStepsAvailable || !isLiveStepsEnabled) {
      return;
    }

    if (!isStepsTrackingEnabled || !canUseNativeSteps || !steps.syncedAt) {
      stopLiveSteps();
      lastLiveStepsPayloadRef.current = null;
      return;
    }

    const payloadKey = `${steps.todaySteps}:${dailyGoal}`;
    if (lastLiveStepsPayloadRef.current === payloadKey) {
      return;
    }

    const syncLiveSteps = async () => {
      if (liveStepsActivityId) {
        await updateLiveSteps(steps.todaySteps, dailyGoal);
        lastLiveStepsPayloadRef.current = payloadKey;
        return;
      }

      const activityId = await startLiveSteps(steps.todaySteps, dailyGoal);
      if (activityId) {
        lastLiveStepsPayloadRef.current = payloadKey;
      }
    };

    syncLiveSteps().catch((err) => console.error("[steps] failed to sync live steps:", err));
  }, [
    canUseNativeSteps,
    dailyGoal,
    isLiveStepsAvailable,
    isLiveStepsEnabled,
    isStepsTrackingEnabled,
    liveStepsActivityId,
    startLiveSteps,
    stopLiveSteps,
    steps.syncedAt,
    steps.todaySteps,
    updateLiveSteps,
  ]);

  useEffect(() => {
    if (!isStepsTrackingEnabled || !canUseNativeSteps) return;
    if (!steps.syncedAt || steps.todaySteps <= 0) return;

    notifications.scheduleDaily(steps.todaySteps, dailyGoal);
  }, [
    canUseNativeSteps,
    dailyGoal,
    isStepsTrackingEnabled,
    notifications.scheduleDaily,
    steps.syncedAt,
    steps.todaySteps,
  ]);

  const value = useMemo(
    () => ({
      steps,
      notifications,
      refreshSteps,
    }),
    [notifications, refreshSteps, steps]
  );

  return <StepsTrackingContext.Provider value={value}>{children}</StepsTrackingContext.Provider>;
};

export const useStepsTracking = () => {
  const value = useContext(StepsTrackingContext);
  if (!value) {
    throw new Error("useStepsTracking must be used inside StepsTrackingProvider");
  }

  return value;
};

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { IStepsCardioType } from "@/interfaces/Workout";
import useStepsData, { UseStepsDataResult } from "@/hooks/api/useStepsData";
import useStepsNotifications, {
  UseStepsNotificationsResult,
} from "@/hooks/api/useStepsNotifications";
import { useStepsProgressApi } from "@/hooks/api/useStepsProgressApi";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";

interface StepsTrackingContextValue {
  steps: UseStepsDataResult;
  notifications: UseStepsNotificationsResult;
  refreshSteps: () => Promise<void>;
}

const StepsTrackingContext = createContext<StepsTrackingContextValue | null>(null);

const HEALTH_REFRESH_INTERVAL_MS = 15 * 1000;
const SERVER_SYNC_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_DAILY_GOAL = 10000;
const ESTIMATED_STEP_STRIDE_METERS = 0.762;

const getLocalDayKey = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

const buildGoalsByDay = (plan: IStepsCardioType | undefined): number[] => {
  if (!plan) {
    return Array.from({ length: 7 }, () => DEFAULT_DAILY_GOAL);
  }
  if (plan.mode === "custom" && plan.perDay && plan.perDay.length === 7) {
    return plan.perDay;
  }
  return Array.from({ length: 7 }, () => plan.daily);
};

export const StepsTrackingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const steps = useStepsData();
  const notifications = useStepsNotifications();
  const { syncStepsProgress } = useStepsProgressApi();
  const { data: workoutPlan } = useWorkoutPlanQuery();

  const lastServerSyncAtRef = useRef(0);
  const lastServerSyncPayloadRef = useRef<string | null>(null);
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

      const date = getLocalDayKey(new Date());
      const source = Platform.OS === "ios" ? "healthkit" : "health_connect";
      const payloadKey = `${date}:${steps.todaySteps}:${steps.todayCalories}:${dailyGoal}:${source}`;
      if (!force && lastServerSyncPayloadRef.current === payloadKey) return;

      try {
        await syncStepsProgress({
          date,
          steps: steps.todaySteps,
          calories: steps.todayCalories,
          distanceKm: Number(
            ((steps.todaySteps * ESTIMATED_STEP_STRIDE_METERS) / 1000).toFixed(2)
          ),
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

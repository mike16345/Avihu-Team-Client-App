import { useCallback, useEffect, useRef, useState } from "react";
import { NativeModules } from "react-native";
import { stepsToDistanceKm } from "@/utils/stepsUtils";

const { RNLiveSteps } = NativeModules as {
  RNLiveSteps?: {
    start: (todaySteps: number, dailyGoal: number, distanceKm: number) => Promise<string>;
    update: (
      activityId: string,
      todaySteps: number,
      dailyGoal: number,
      distanceKm: number
    ) => Promise<string>;
    stop: (activityId: string) => Promise<boolean>;
    stopAll: () => Promise<number>;
    areActivitiesEnabled: () => Promise<boolean>;
  };
};

export interface UseLiveStepsActivityResult {
  isAvailable: boolean;
  isEnabled: boolean;
  activityId: string | null;
  start: (todaySteps: number, dailyGoal: number) => Promise<string | null>;
  update: (todaySteps: number, dailyGoal: number) => Promise<void>;
  stop: () => Promise<void>;
}

const useLiveStepsActivity = (): UseLiveStepsActivityResult => {
  const isAvailable = RNLiveSteps != null;
  const activityIdRef = useRef<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (!isAvailable) return;
    RNLiveSteps!.areActivitiesEnabled()
      .then(setIsEnabled)
      .catch(() => setIsEnabled(false));
  }, [isAvailable]);

  const start = useCallback(
    async (todaySteps: number, dailyGoal: number): Promise<string | null> => {
      if (!isAvailable) return null;
      try {
        const distanceKm = stepsToDistanceKm(todaySteps, 2);
        const id = await RNLiveSteps!.start(todaySteps, dailyGoal, distanceKm);
        activityIdRef.current = id;
        setActivityId(id);
        return id;
      } catch {
        return null;
      }
    },
    [isAvailable]
  );

  const update = useCallback(
    async (todaySteps: number, dailyGoal: number): Promise<void> => {
      if (!isAvailable || !activityIdRef.current) return;
      try {
        const distanceKm = stepsToDistanceKm(todaySteps, 2);
        await RNLiveSteps!.update(activityIdRef.current, todaySteps, dailyGoal, distanceKm);
      } catch {
        // update failure is non-fatal
      }
    },
    [isAvailable]
  );

  const stop = useCallback(async (): Promise<void> => {
    if (!isAvailable || !activityIdRef.current) return;
    try {
      await RNLiveSteps!.stop(activityIdRef.current);
    } catch {
      // ignore
    } finally {
      activityIdRef.current = null;
      setActivityId(null);
    }
  }, [isAvailable]);

  return { isAvailable, isEnabled, activityId, start, update, stop };
};

export default useLiveStepsActivity;

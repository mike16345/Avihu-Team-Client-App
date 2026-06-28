import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StepsPermissionStatus = "needsPermission" | "denied" | "granted";

export interface StepsDayDatum {
  date: string;
  steps: number;
  calories: number;
}

export interface StepsWeekDatum {
  startDate: string;
  endDate: string;
  days: StepsDayDatum[];
}

export interface UseStepsDataResult {
  status: StepsPermissionStatus;
  todaySteps: number;
  todayCalories: number;
  week: StepsDayDatum[];
  weeks: StepsWeekDatum[];
  syncedAt: Date | null;
  requestPermission: () => Promise<void>;
  refresh: () => Promise<void>;
  isNativeAvailable: boolean;
}

const STEPS_HEALTH_CONNECTED_KEY = "steps-health-connected";
const RECENT_WEEKS_TO_READ = 8;

const loadNativeIOS = () => {
  try {
    const { NativeModules } = require("react-native");
    const nativeModule = NativeModules?.AppleHealthKit;
    const mod = require("react-native-health");
    const packageModule = mod?.default ?? mod;
    const AppleHealthKit = nativeModule ?? packageModule;

    if (AppleHealthKit && packageModule?.Constants && !AppleHealthKit.Constants) {
      AppleHealthKit.Constants = packageModule.Constants;
    }

    if (!AppleHealthKit?.initHealthKit) {
      console.error(
        "[steps] HealthKit native side is NOT linked. NativeModules.AppleHealthKit:",
        nativeModule ? Object.keys(nativeModule) : "undefined",
        "react-native-health export keys:",
        packageModule ? Object.keys(packageModule) : "undefined",
        "- install a new EAS/dev-client binary that includes react-native-health. Expo Go or an OTA update cannot add this native module."
      );
      return null;
    }
    return AppleHealthKit;
  } catch (err) {
    console.error("[steps] require(react-native-health) failed:", err);
    return null;
  }
};

const loadNativeAndroid = () => {
  try {
    return require("react-native-health-connect");
  } catch {
    return null;
  }
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const dayKey = (d: Date) => {
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
};

const stepsToCalories = (steps: number) => Math.round(steps * 0.04);

const getWeekDates = (today: Date): Date[] => {
  const todayDow = today.getDay();
  const sunday = startOfDay(today);
  sunday.setDate(sunday.getDate() - todayDow);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
};

const getWeekStart = (date: Date) => getWeekDates(date)[0];

const getRecentWeekStarts = (today: Date): Date[] => {
  const currentWeekStart = getWeekStart(today);
  return Array.from({ length: RECENT_WEEKS_TO_READ }, (_, i) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (RECENT_WEEKS_TO_READ - 1 - i) * 7);
    return weekStart;
  });
};

const buildEmptyWeek = (today: Date): StepsDayDatum[] =>
  getWeekDates(today).map((d) => ({ date: dayKey(d), steps: 0, calories: 0 }));

const buildEmptyWeeks = (today: Date): StepsWeekDatum[] =>
  getRecentWeekStarts(today).map((weekStart) => {
    const days = getWeekDates(weekStart).map((d) => ({
      date: dayKey(d),
      steps: 0,
      calories: 0,
    }));
    return {
      startDate: days[0].date,
      endDate: days[days.length - 1].date,
      days,
    };
  });

const buildWeekFromMap = (
  today: Date,
  byDay: Record<string, number>
): { todaySteps: number; week: StepsDayDatum[] } => {
  const weekDates = getWeekDates(today);
  const todayKey = dayKey(today);
  const week: StepsDayDatum[] = weekDates.map((d) => {
    const k = dayKey(d);
    const isFuture = k > todayKey;
    const steps = isFuture ? 0 : Math.round(byDay[k] ?? 0);
    return { date: k, steps, calories: stepsToCalories(steps) };
  });
  const todayDatum = week.find((w) => w.date === todayKey);
  return { todaySteps: todayDatum?.steps ?? 0, week };
};

const buildWeeksFromMap = (today: Date, byDay: Record<string, number>): StepsWeekDatum[] => {
  const todayKey = dayKey(today);
  return getRecentWeekStarts(today).map((weekStart) => {
    const days = getWeekDates(weekStart).map((d) => {
      const k = dayKey(d);
      const isFuture = k > todayKey;
      const steps = isFuture ? 0 : Math.round(byDay[k] ?? 0);
      return { date: k, steps, calories: stepsToCalories(steps) };
    });

    return {
      startDate: days[0].date,
      endDate: days[days.length - 1].date,
      days,
    };
  });
};

const readIOS = async (
  native: any,
  today: Date
): Promise<{ steps: number; calories: number; week: StepsDayDatum[]; weeks: StepsWeekDatum[] }> => {
  const AppleHealthKit = native;
  return new Promise((resolve) => {
    const recentWeekStarts = getRecentWeekStarts(today);
    const firstSunday = recentWeekStarts[0];

    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: firstSunday.toISOString(),
        endDate: today.toISOString(),
      },
      (err: any, results: Array<{ startDate: string; value: number }>) => {
        if (err) {
          console.error("[steps] getDailyStepCountSamples error:", err);
          resolve({
            steps: 0,
            calories: 0,
            week: buildEmptyWeek(today),
            weeks: buildEmptyWeeks(today),
          });
          return;
        }
        if (!results) {
          resolve({
            steps: 0,
            calories: 0,
            week: buildEmptyWeek(today),
            weeks: buildEmptyWeeks(today),
          });
          return;
        }
        const byDay: Record<string, number> = {};
        for (const r of results) {
          const k = dayKey(new Date(r.startDate));
          byDay[k] = (byDay[k] ?? 0) + r.value;
        }
        const { todaySteps, week } = buildWeekFromMap(today, byDay);
        const weeks = buildWeeksFromMap(today, byDay);
        resolve({
          steps: todaySteps,
          calories: stepsToCalories(todaySteps),
          week,
          weeks,
        });
      }
    );
  });
};

const readIOSTodaySteps = async (native: any, today: Date): Promise<number | null> => {
  const AppleHealthKit = native;

  return new Promise((resolve) => {
    AppleHealthKit.getStepCount(
      {
        date: today.toISOString(),
        includeManuallyAdded: true,
      },
      (err: any, result?: { value?: number }) => {
        if (err) {
          console.error("[steps] getStepCount error:", err);
          resolve(null);
          return;
        }

        resolve(typeof result?.value === "number" ? Math.round(result.value) : null);
      }
    );
  });
};

const readAndroid = async (
  native: any,
  today: Date
): Promise<{ steps: number; calories: number; week: StepsDayDatum[]; weeks: StepsWeekDatum[] }> => {
  const recentWeekStarts = getRecentWeekStarts(today);
  const firstSunday = recentWeekStarts[0];

  const records = await native.readRecords("Steps", {
    timeRangeFilter: {
      operator: "between",
      startTime: firstSunday.toISOString(),
      endTime: today.toISOString(),
    },
  });

  const list: Array<{ startTime: string; count: number }> = records?.records ?? [];
  const byDay: Record<string, number> = {};
  for (const r of list) {
    const k = dayKey(new Date(r.startTime));
    byDay[k] = (byDay[k] ?? 0) + r.count;
  }
  const { todaySteps, week } = buildWeekFromMap(today, byDay);
  const weeks = buildWeeksFromMap(today, byDay);
  return { steps: todaySteps, calories: stepsToCalories(todaySteps), week, weeks };
};

const requestIOSPermission = async (native: any): Promise<boolean> => {
  const AppleHealthKit = native;
  if (!AppleHealthKit?.Constants?.Permissions) {
    console.error("[steps] HealthKit module shape unexpected", Object.keys(AppleHealthKit ?? {}));
    return false;
  }
  const Permissions = AppleHealthKit.Constants.Permissions;
  const read = [
    Permissions.StepCount,
    Permissions.Steps,
    Permissions.DistanceWalkingRunning,
    Permissions.ActiveEnergyBurned,
  ].filter(Boolean);
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit({ permissions: { read, write: [] } }, (err: any) => {
      if (err) {
        console.error("[steps] initHealthKit error:", err);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

const markHealthConnected = async () => {
  try {
    await AsyncStorage.setItem(STEPS_HEALTH_CONNECTED_KEY, "true");
  } catch {
    // persistence failure should not block HealthKit reads
  }
};

const hasConnectedHealthBefore = async () => {
  try {
    return (await AsyncStorage.getItem(STEPS_HEALTH_CONNECTED_KEY)) === "true";
  } catch {
    return false;
  }
};

const requestAndroidPermission = async (native: any): Promise<boolean> => {
  try {
    await native.initialize();
    const grantedPermissions = await native.requestPermission([
      { accessType: "read", recordType: "Steps" },
    ]);
    return grantedPermissions.length > 0;
  } catch {
    return false;
  }
};

const initializeAndroidExistingConnection = async (native: any): Promise<boolean> => {
  try {
    await native.initialize();
    const grantedPermissions = await native.getGrantedPermissions?.();
    return Array.isArray(grantedPermissions)
      ? grantedPermissions.some(
          (permission) =>
            permission?.accessType === "read" && permission?.recordType === "Steps"
        )
      : false;
  } catch {
    return false;
  }
};

const useStepsData = (): UseStepsDataResult => {
  const native = useMemo(
    () => (Platform.OS === "ios" ? loadNativeIOS() : loadNativeAndroid()),
    []
  );
  const isNativeAvailable = native != null;

  const [status, setStatus] = useState<StepsPermissionStatus>("needsPermission");
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [week, setWeek] = useState<StepsDayDatum[]>(buildEmptyWeek(new Date()));
  const [weeks, setWeeks] = useState<StepsWeekDatum[]>(buildEmptyWeeks(new Date()));
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const refreshInFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!native) return;
    if (refreshInFlightRef.current) return;

    refreshInFlightRef.current = true;
    try {
      const today = new Date();
      const data =
        Platform.OS === "ios" ? await readIOS(native, today) : await readAndroid(native, today);
      if (Platform.OS === "ios" && data.steps === 0) {
        const fallbackTodaySteps = await readIOSTodaySteps(native, today);
        if (fallbackTodaySteps !== null && fallbackTodaySteps > 0) {
          const todayKey = dayKey(today);
          data.steps = fallbackTodaySteps;
          data.calories = stepsToCalories(fallbackTodaySteps);
          data.week = data.week.map((day) =>
            day.date === todayKey
              ? {
                  ...day,
                  steps: fallbackTodaySteps,
                  calories: stepsToCalories(fallbackTodaySteps),
                }
              : day
          );
          data.weeks = data.weeks.map((weekDatum) => ({
            ...weekDatum,
            days: weekDatum.days.map((day) =>
              day.date === todayKey
                ? {
                    ...day,
                    steps: fallbackTodaySteps,
                    calories: stepsToCalories(fallbackTodaySteps),
                  }
                : day
            ),
          }));
        }
      }
      setTodaySteps(data.steps);
      setTodayCalories(data.calories);
      setWeek(data.week);
      setWeeks(data.weeks);
      setSyncedAt(new Date());
      setStatus("granted");
    } catch {
      // leave existing state in place
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [native]);

  const requestPermission = useCallback(async () => {
    if (!native) {
      console.error("[steps] requestPermission called but native module is null");
      setStatus("denied");
      return;
    }
    try {
      const granted =
        Platform.OS === "ios"
          ? await requestIOSPermission(native)
          : await requestAndroidPermission(native);
      if (granted) {
        await markHealthConnected();
        setStatus("granted");
        await refresh();
      } else {
        setStatus("denied");
      }
    } catch (err) {
      console.error("[steps] requestPermission threw:", err);
      setStatus("denied");
    }
  }, [native, refresh]);

  useEffect(() => {
    if (!native) return;

    let isMounted = true;

    const initializeExistingConnection = async () => {
      const connectedBefore = await hasConnectedHealthBefore();
      if (!connectedBefore || !isMounted) return;

      const initialized =
        Platform.OS === "ios"
          ? await requestIOSPermission(native)
          : await initializeAndroidExistingConnection(native);

      if (!initialized || !isMounted) return;

      setStatus("granted");
      await refresh();
    };

    initializeExistingConnection();

    return () => {
      isMounted = false;
    };
  }, [native, refresh]);

  return {
    status,
    todaySteps,
    todayCalories,
    week,
    weeks,
    syncedAt,
    requestPermission,
    refresh,
    isNativeAvailable,
  };
};

export default useStepsData;

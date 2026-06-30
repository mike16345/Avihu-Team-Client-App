import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  aggregateGroupByPeriod as aggregateHealthConnectGroupByPeriod,
  getGrantedPermissions as getHealthConnectGrantedPermissions,
  initialize as initializeHealthConnect,
  readRecords as readHealthConnectRecords,
  requestPermission as requestHealthConnectPermission,
} from "react-native-health-connect";
import { getLocalDateKey, stepsToCalories } from "@/utils/stepsUtils";

export type StepsPermissionStatus = "needsPermission" | "denied" | "granted";
type StepsByDay = Record<string, number>;

interface NativeAndroidModule {
  aggregateGroupByPeriod: typeof aggregateHealthConnectGroupByPeriod;
  getGrantedPermissions: typeof getHealthConnectGrantedPermissions;
  initialize: typeof initializeHealthConnect;
  readRecords: typeof readHealthConnectRecords;
  requestPermission: typeof requestHealthConnectPermission;
}

interface StepsReadResult {
  steps: number;
  calories: number;
  week: StepsDayDatum[];
  weeks: StepsWeekDatum[];
}

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
  weeks: StepsWeekDatum[];
  syncedAt: Date | null;
  requestPermission: () => Promise<boolean>;
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

const loadNativeAndroid = () =>
  ({
    aggregateGroupByPeriod: aggregateHealthConnectGroupByPeriod,
    getGrantedPermissions: getHealthConnectGrantedPermissions,
    initialize: initializeHealthConnect,
    readRecords: readHealthConnectRecords,
    requestPermission: requestHealthConnectPermission,
  }) satisfies NativeAndroidModule;

const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const dayKey = (date: Date) => getLocalDateKey(date);

const getWeekDates = (date: Date): Date[] => {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + index);
    return nextDate;
  });
};

const getWeekStart = (date: Date) => getWeekDates(date)[0];

const getRecentWeekStarts = (today: Date): Date[] => {
  const currentWeekStart = getWeekStart(today);

  return Array.from({ length: RECENT_WEEKS_TO_READ }, (_, index) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (RECENT_WEEKS_TO_READ - 1 - index) * 7);
    return weekStart;
  });
};

const buildDayDatum = (date: Date, todayKey: string, byDay: StepsByDay): StepsDayDatum => {
  const key = dayKey(date);
  const isFuture = key > todayKey;
  const steps = isFuture ? 0 : Math.round(byDay[key] ?? 0);

  return {
    date: key,
    steps,
    calories: stepsToCalories(steps),
  };
};

const buildEmptyWeek = (today: Date): StepsDayDatum[] =>
  getWeekDates(today).map((date) => ({ date: dayKey(date), steps: 0, calories: 0 }));

const buildEmptyWeeks = (today: Date): StepsWeekDatum[] =>
  getRecentWeekStarts(today).map((weekStart) => {
    const days = getWeekDates(weekStart).map((date) => ({
      date: dayKey(date),
      steps: 0,
      calories: 0,
    }));

    return {
      startDate: days[0].date,
      endDate: days[days.length - 1].date,
      days,
    };
  });

const buildEmptyResult = (today: Date): StepsReadResult => ({
  steps: 0,
  calories: 0,
  week: buildEmptyWeek(today),
  weeks: buildEmptyWeeks(today),
});

const buildWeekFromMap = (
  today: Date,
  byDay: StepsByDay
): { todaySteps: number; week: StepsDayDatum[] } => {
  const todayKey = dayKey(today);
  const week = getWeekDates(today).map((date) => buildDayDatum(date, todayKey, byDay));
  const todayDatum = week.find((entry) => entry.date === todayKey);

  return {
    todaySteps: todayDatum?.steps ?? 0,
    week,
  };
};

const buildWeeksFromMap = (today: Date, byDay: StepsByDay): StepsWeekDatum[] => {
  const todayKey = dayKey(today);

  return getRecentWeekStarts(today).map((weekStart) => {
    const days = getWeekDates(weekStart).map((date) => buildDayDatum(date, todayKey, byDay));

    return {
      startDate: days[0].date,
      endDate: days[days.length - 1].date,
      days,
    };
  });
};

const buildResultFromByDay = (today: Date, byDay: StepsByDay): StepsReadResult => {
  const { todaySteps, week } = buildWeekFromMap(today, byDay);

  return {
    steps: todaySteps,
    calories: stepsToCalories(todaySteps),
    week,
    weeks: buildWeeksFromMap(today, byDay),
  };
};

const applyTodayStepsFallback = (
  data: StepsReadResult,
  today: Date,
  fallbackTodaySteps: number
) => {
  const todayKey = dayKey(today);
  const fallbackCalories = stepsToCalories(fallbackTodaySteps);

  data.steps = fallbackTodaySteps;
  data.calories = fallbackCalories;
  data.week = data.week.map((day) =>
    day.date === todayKey ? { ...day, steps: fallbackTodaySteps, calories: fallbackCalories } : day
  );
  data.weeks = data.weeks.map((weekDatum) => ({
    ...weekDatum,
    days: weekDatum.days.map((day) =>
      day.date === todayKey
        ? { ...day, steps: fallbackTodaySteps, calories: fallbackCalories }
        : day
    ),
  }));
};

const readIOS = async (native: any, today: Date): Promise<StepsReadResult> => {
  const AppleHealthKit = native;

  return new Promise((resolve) => {
    const firstWeekStart = getRecentWeekStarts(today)[0];

    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: firstWeekStart.toISOString(),
        endDate: today.toISOString(),
      },
      (err: any, results: Array<{ startDate: string; value: number }>) => {
        if (err) {
          console.error("[steps] getDailyStepCountSamples error:", err);
          resolve(buildEmptyResult(today));
          return;
        }

        if (!results) {
          resolve(buildEmptyResult(today));
          return;
        }

        const byDay: StepsByDay = {};

        for (const result of results) {
          const key = dayKey(new Date(result.startDate));
          byDay[key] = (byDay[key] ?? 0) + result.value;
        }

        resolve(buildResultFromByDay(today, byDay));
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

const readAndroid = async (native: NativeAndroidModule, today: Date): Promise<StepsReadResult> => {
  const firstWeekStart = getRecentWeekStarts(today)[0];
  const timeRangeFilter = {
    operator: "between" as const,
    startTime: firstWeekStart.toISOString(),
    endTime: today.toISOString(),
  };
  const byDay: StepsByDay = {};

  try {
    const aggregateGroups = await native.aggregateGroupByPeriod?.({
      recordType: "Steps",
      timeRangeFilter,
      timeRangeSlicer: { period: "DAYS", length: 1 },
    });

    if (Array.isArray(aggregateGroups)) {
      console.log(
        "[steps] Android Health Connect aggregate groups:",
        aggregateGroups.map((group: any) => ({
          startTime: group?.startTime,
          endTime: group?.endTime,
          countTotal: group?.result?.COUNT_TOTAL ?? 0,
          dataOrigins: group?.result?.dataOrigins ?? [],
        }))
      );

      for (const group of aggregateGroups) {
        const key = dayKey(new Date(group.startTime));
        byDay[key] = Math.round(group?.result?.COUNT_TOTAL ?? 0);
      }
    }
  } catch (err) {
    console.error("[steps] Android Health Connect aggregateGroupByPeriod failed:", err);
  }

  const records = await native.readRecords("Steps", {
    timeRangeFilter,
    pageSize: 500,
  });

  const list: Array<{ startTime: string; count: number; metadata?: { dataOrigin?: string } }> =
    records?.records ?? [];

  if (Object.keys(byDay).length === 0) {
    for (const record of list) {
      const key = dayKey(new Date(record.startTime));
      byDay[key] = (byDay[key] ?? 0) + record.count;
    }
  }

  if (Object.keys(byDay).length === 0) {
    console.log(
      "[steps] Android Health Connect returned no step aggregates or step records for the requested range."
    );
  }

  return buildResultFromByDay(today, byDay);
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

const requestAndroidPermission = async (native: NativeAndroidModule): Promise<boolean> => {
  try {
    await native.initialize();
    const grantedPermissions = await native.requestPermission([
      { accessType: "read", recordType: "Steps" },
    ]);
    console.log("[steps] Android Health Connect permission result:", grantedPermissions);
    return grantedPermissions.length > 0;
  } catch (err) {
    console.error("[steps] Android Health Connect requestPermission failed:", err);
    return false;
  }
};

const initializeAndroidExistingConnection = async (
  native: NativeAndroidModule
): Promise<boolean> => {
  try {
    await native.initialize();
    const grantedPermissions = await native.getGrantedPermissions?.();
    console.log("[steps] Android Health Connect granted permissions:", grantedPermissions);

    return Array.isArray(grantedPermissions)
      ? grantedPermissions.some(
          (permission) => permission?.accessType === "read" && permission?.recordType === "Steps"
        )
      : false;
  } catch (err) {
    console.error("[steps] Android Health Connect initialize/getGrantedPermissions failed:", err);
    return false;
  }
};

const useStepsData = (): UseStepsDataResult => {
  const native = useMemo(() => (Platform.OS === "ios" ? loadNativeIOS() : loadNativeAndroid()), []);
  const isNativeAvailable = native != null;

  const [status, setStatus] = useState<StepsPermissionStatus>("needsPermission");
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [weeks, setWeeks] = useState<StepsWeekDatum[]>(buildEmptyWeeks(new Date()));
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const refreshInFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!native || refreshInFlightRef.current) return;

    refreshInFlightRef.current = true;

    try {
      const today = new Date();
      const data =
        Platform.OS === "ios"
          ? await readIOS(native, today)
          : await readAndroid(native as NativeAndroidModule, today);

      if (Platform.OS === "ios" && data.steps === 0) {
        const fallbackTodaySteps = await readIOSTodaySteps(native, today);
        if (fallbackTodaySteps !== null && fallbackTodaySteps > 0) {
          applyTodayStepsFallback(data, today, fallbackTodaySteps);
        }
      }

      setTodaySteps(data.steps);
      setTodayCalories(data.calories);
      setWeeks(data.weeks);
      setSyncedAt(new Date());
      setStatus("granted");
    } catch (err) {
      console.error("[steps] refresh failed:", err);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [native]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!native) {
      console.error("[steps] requestPermission called but native module is null");
      setStatus("denied");
      return false;
    }

    try {
      const granted =
        Platform.OS === "ios"
          ? await requestIOSPermission(native)
          : await requestAndroidPermission(native as NativeAndroidModule);

      if (!granted) {
        setStatus("denied");
        return false;
      }

      await markHealthConnected();
      setStatus("granted");
      await refresh();
      return true;
    } catch (err) {
      console.error("[steps] requestPermission threw:", err);
      setStatus("denied");
      return false;
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
          : await initializeAndroidExistingConnection(native as NativeAndroidModule);

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
    weeks,
    syncedAt,
    requestPermission,
    refresh,
    isNativeAvailable,
  };
};

export default useStepsData;

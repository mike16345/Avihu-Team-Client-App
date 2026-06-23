import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export type StepsPermissionStatus = "needsPermission" | "denied" | "granted";

export interface StepsDayDatum {
  date: string;
  steps: number;
  calories: number;
}

export interface UseStepsDataResult {
  status: StepsPermissionStatus;
  todaySteps: number;
  todayCalories: number;
  week: StepsDayDatum[];
  syncedAt: Date | null;
  requestPermission: () => Promise<void>;
  refresh: () => Promise<void>;
  isNativeAvailable: boolean;
}

// MIKE: After running `eas build --profile development` with the new HealthKit /
// Health Connect native modules linked, uncomment the require lines below and
// delete the `return null` lines. Until then, the hook gracefully reports
// isNativeAvailable=false and the screen falls back to demo data.
const loadNativeIOS = () => {
  return null;
  // try {
  //   return require("react-native-health");
  // } catch {
  //   return null;
  // }
};

const loadNativeAndroid = () => {
  return null;
  // try {
  //   return require("react-native-health-connect");
  // } catch {
  //   return null;
  // }
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const dayKey = (d: Date) => {
  return new Date(d).toISOString().slice(0, 10);
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

const buildEmptyWeek = (today: Date): StepsDayDatum[] =>
  getWeekDates(today).map((d) => ({ date: dayKey(d), steps: 0, calories: 0 }));

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

const readIOS = async (
  native: any,
  today: Date
): Promise<{ steps: number; calories: number; week: StepsDayDatum[] }> => {
  const AppleHealthKit = native.default ?? native;
  return new Promise((resolve) => {
    const weekDates = getWeekDates(today);
    const sunday = weekDates[0];

    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: sunday.toISOString(),
        endDate: today.toISOString(),
      },
      (err: any, results: Array<{ startDate: string; value: number }>) => {
        if (err || !results) {
          resolve({ steps: 0, calories: 0, week: buildEmptyWeek(today) });
          return;
        }
        const byDay: Record<string, number> = {};
        for (const r of results) {
          const k = dayKey(new Date(r.startDate));
          byDay[k] = (byDay[k] ?? 0) + r.value;
        }
        const { todaySteps, week } = buildWeekFromMap(today, byDay);
        resolve({
          steps: todaySteps,
          calories: stepsToCalories(todaySteps),
          week,
        });
      }
    );
  });
};

const readAndroid = async (
  native: any,
  today: Date
): Promise<{ steps: number; calories: number; week: StepsDayDatum[] }> => {
  const weekDates = getWeekDates(today);
  const sunday = weekDates[0];

  const records = await native.readRecords("Steps", {
    timeRangeFilter: {
      operator: "between",
      startTime: sunday.toISOString(),
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
  return { steps: todaySteps, calories: stepsToCalories(todaySteps), week };
};

const requestIOSPermission = async (native: any): Promise<boolean> => {
  const AppleHealthKit = native.default ?? native;
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(
      {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          ],
          write: [],
        },
      },
      (err: any) => {
        resolve(!err);
      }
    );
  });
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

const useStepsData = (): UseStepsDataResult => {
  const native = Platform.OS === "ios" ? loadNativeIOS() : loadNativeAndroid();
  const isNativeAvailable = native != null;

  const [status, setStatus] = useState<StepsPermissionStatus>("needsPermission");
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [week, setWeek] = useState<StepsDayDatum[]>(buildEmptyWeek(new Date()));
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!native) return;
    try {
      const today = new Date();
      const data =
        Platform.OS === "ios"
          ? await readIOS(native, today)
          : await readAndroid(native, today);
      setTodaySteps(data.steps);
      setTodayCalories(data.calories);
      setWeek(data.week);
      setSyncedAt(new Date());
    } catch {
      // leave existing state in place
    }
  }, [native]);

  const requestPermission = useCallback(async () => {
    if (!native) {
      setStatus("denied");
      return;
    }
    const granted =
      Platform.OS === "ios"
        ? await requestIOSPermission(native)
        : await requestAndroidPermission(native);
    if (granted) {
      setStatus("granted");
      await refresh();
    } else {
      setStatus("denied");
    }
  }, [native, refresh]);

  useEffect(() => {
    if (!native) return;
    refresh();
  }, [native, refresh]);

  return {
    status,
    todaySteps,
    todayCalories,
    week,
    syncedAt,
    requestPermission,
    refresh,
    isNativeAvailable,
  };
};

export default useStepsData;

import { useCallback, useEffect, useMemo, useRef } from "react";

const STEPS_NOTIFICATION_IDENTIFIER = "avihu-team-daily-steps";
const NOTIFICATION_HOUR = 8;
const NOTIFICATION_MINUTE = 0;

const loadNotifications = () => {
  try {
    return require("expo-notifications");
  } catch {
    return null;
  }
};

const formatSteps = (n: number): string => Math.round(n).toLocaleString("he-IL");

const getLocalDayKey = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};

const buildBody = (todaySteps: number, dailyGoal: number) => {
  const remaining = Math.max(dailyGoal - todaySteps, 0);
  if (remaining === 0) {
    return `סיימת את היעד היומי — ${formatSteps(todaySteps)} צעדים! 🎯`;
  }
  return `צעדים היום: ${formatSteps(todaySteps)} / ${formatSteps(dailyGoal)}`;
};

export interface UseStepsNotificationsResult {
  isAvailable: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleDaily: (todaySteps: number, dailyGoal: number) => Promise<void>;
  cancel: () => Promise<void>;
}

const useStepsNotifications = (): UseStepsNotificationsResult => {
  const notifModuleRef = useRef(loadNotifications());
  const scheduledKeyRef = useRef<string | null>(null);
  const isAvailable = notifModuleRef.current != null;

  useEffect(() => {
    const Notifications = notifModuleRef.current;
    if (!Notifications) return;
    Notifications.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const Notifications = notifModuleRef.current;
    if (!Notifications) return false;
    try {
      const existing = await Notifications.getPermissionsAsync();
      if (existing?.status === "granted") return true;
      const requested = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: false },
      });
      return requested?.status === "granted";
    } catch {
      return false;
    }
  }, []);

  const cancel = useCallback(async (): Promise<void> => {
    const Notifications = notifModuleRef.current;
    if (!Notifications) return;
    scheduledKeyRef.current = null;
    try {
      await Notifications.cancelScheduledNotificationAsync(STEPS_NOTIFICATION_IDENTIFIER);
    } catch {
      // identifier may not exist; ignore
    }
  }, []);

  const scheduleDaily = useCallback(
    async (todaySteps: number, dailyGoal: number): Promise<void> => {
      const Notifications = notifModuleRef.current;
      if (!Notifications) return;

      const permission = await Notifications.getPermissionsAsync();
      if (permission?.status !== "granted") return;

      const scheduleKey = `${getLocalDayKey()}:${dailyGoal}`;
      if (scheduledKeyRef.current === scheduleKey) return;

      try {
        await Notifications.cancelScheduledNotificationAsync(STEPS_NOTIFICATION_IDENTIFIER);
      } catch {
        // ignore
      }
      try {
        const calendarTriggerType = Notifications.SchedulableTriggerInputTypes?.CALENDAR;
        await Notifications.scheduleNotificationAsync({
          identifier: STEPS_NOTIFICATION_IDENTIFIER,
          content: {
            title: "Avihu Team",
            body: buildBody(todaySteps, dailyGoal),
            data: { type: "daily-steps" },
          },
          trigger: calendarTriggerType
            ? {
                type: calendarTriggerType,
                hour: NOTIFICATION_HOUR,
                minute: NOTIFICATION_MINUTE,
                repeats: true,
              }
            : {
                hour: NOTIFICATION_HOUR,
                minute: NOTIFICATION_MINUTE,
                repeats: true,
              },
        });
        scheduledKeyRef.current = scheduleKey;
      } catch {
        // schedule failure is non-fatal
      }
    },
    []
  );

  return useMemo(
    () => ({ isAvailable, requestPermission, scheduleDaily, cancel }),
    [cancel, isAvailable, requestPermission, scheduleDaily]
  );
};

export default useStepsNotifications;

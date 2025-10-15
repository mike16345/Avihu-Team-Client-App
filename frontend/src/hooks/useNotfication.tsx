// hooks/useNotification.ts
import { useNotificationStore } from "@/store/notificationStore";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const { addNotification } = useNotificationStore();

type TriggerAt = number | Date | null | undefined;

const DEFAULT_CHANNEL_ID = "default";
const DAILY_REMINDER_ID = "daily-8am-reminder";

/** Create (or update) the default Android notification channel */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Helper: convert various "when" inputs to a typed NotificationTriggerInput */
function toTrigger(
  triggerAt: TriggerAt,
  opts: { repeats?: boolean; channelId?: string } = {}
): Notifications.NotificationTriggerInput {
  if (triggerAt == null) {
    // Immediate delivery must be `null` (not {}).
    return null;
  }

  if (triggerAt instanceof Date) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerAt,
      channelId: opts.channelId,
    } satisfies Notifications.DateTriggerInput;
  }

  // seconds-from-now; clamp to >= 1s
  const seconds = Math.max(1, Math.floor(triggerAt));
  return {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: !!opts.repeats,
    channelId: opts.channelId,
  } satisfies Notifications.TimeIntervalTriggerInput;
}

/** Compute the next local 08:00 from "now" */
function getNextEightAM(from = new Date()) {
  const next = new Date(from);
  next.setHours(8, 0, 0, 0);
  if (next <= from) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export const useNotification = () => {
  // Set the global notification handler (keeps your previous behavior)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  /** Ask for permissions (creates Android channel first) */
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await ensureAndroidChannel();
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        alert("The app will run better with notifications on!");
      }
    }
  };

  /** Schedule the daily reminder at 08:00 (idempotent) */
  const scheduleDailyReminder = async () => {
    const next8am = getNextEightAM();

    // iOS: true repeating daily trigger at hh:mm
    const iosTrigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    };

    // Android: schedule a one-off date at next 08:00 (re-schedule later as needed)
    const androidTrigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: next8am,
      channelId: DEFAULT_CHANNEL_ID,
    };

    if (Platform.OS === "android") {
      await ensureAndroidChannel();
    }

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: "Avihu Team",
        body: "לא לשכוח לשלוח את השקילה היומית שלכם!",
      },
      trigger: Platform.OS === "ios" ? iosTrigger : androidTrigger,
    });
  };

  /** Show a one-off notification now or in N seconds, or at a Date */
  const showNotification = async (body: string, triggerAt?: number | Date | null) => {
    try {
      if (Platform.OS === "android") {
        await ensureAndroidChannel();
      }
      const identifier = await Notifications.scheduleNotificationAsync({
        content: { title: "Avihu Team", body },
        trigger: toTrigger(triggerAt ?? 1, {
          channelId: Platform.OS === "android" ? DEFAULT_CHANNEL_ID : undefined,
        }),
      });
      return identifier;
    } catch (error) {
      console.log(error);
    }
  };

  /** Initialize: avoid duplicates (don’t blanket-cancel on Android) */
  const initializeNotifications = async () => {
    try {
      if (Platform.OS === "android") {
        await ensureAndroidChannel();
      }

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const alreadyScheduled = scheduled.some((n) => n.identifier === DAILY_REMINDER_ID);

      if (!alreadyScheduled) {
        await scheduleDailyReminder();
      } else if (Platform.OS === "android") {
        // Optional: on Android, if the scheduled time drifted (e.g., across DST),
        // you could cancel & re-schedule here by checking the trigger.
        // For now, we leave it as-is to keep behavior predictable.
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancelNotification = async (identifier: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.log(error);
    }
  };

  const notificationReceivedListener = () => {
    try {
      return Notifications.addNotificationReceivedListener((n) => {
        const { title, body, data } = n.request.content;

        addNotification({
          id: n.request.identifier,
          title,
          body,
          data,
          createdAt: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    requestPermissions,
    initializeNotifications,
    showNotification,
    cancelNotification,
    scheduleDailyReminder,
    notificationReceivedListener,
  };
};

export default useNotification;

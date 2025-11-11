// hooks/useNotification.ts
import {
  NOTIFICATION_TITLE,
  NotificationBodies,
  NotificationIdentifiers,
} from "@/constants/notifications";
import { useNotificationStore } from "@/store/notificationStore";
import { getNextEightAM, getNextEightAMOnSunday, toTrigger } from "@/utils/notification";
import { generateUniqueId } from "@/utils/utils";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type TriggerAt = number | Date | null | undefined;

const DEFAULT_CHANNEL_ID = "default";

/** Create (or update) the default Android notification channel */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export const useNotification = () => {
  // Set the global notification handler (keeps your previous behavior)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
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
  const scheduleDailyWeightInReminder = async () => {
    const next8am = getNextEightAM();

    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: next8am,
      channelId: DEFAULT_CHANNEL_ID,
    };

    if (Platform.OS === "android") {
      await ensureAndroidChannel();
    }

    const data = { id: generateUniqueId() };

    await Notifications.scheduleNotificationAsync({
      identifier: NotificationIdentifiers.NEW_DAILY_WEIGH_IN_REMINDER_ID,
      content: {
        title: NOTIFICATION_TITLE,
        body: NotificationBodies.DAILY_WEIGH_IN_REMINDER,
        data,
      },
      trigger,
    });

    useNotificationStore.getState().addWeighInNotification(data.id);
  };

  const scheduleWeeklyMeasurementReminder = async () => {
    const nextSunday8am = getNextEightAMOnSunday();

    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextSunday8am,
      channelId: DEFAULT_CHANNEL_ID,
    };

    if (Platform.OS === "android") {
      await ensureAndroidChannel();
    }

    const data = { id: generateUniqueId() };

    await Notifications.scheduleNotificationAsync({
      identifier: NotificationIdentifiers.WEEKLY_MEASUERMENT_REMINDER_ID,
      content: {
        title: NOTIFICATION_TITLE,
        body: NotificationBodies.WEEKLY_MEASUERMENT_REMINDER,
        data,
      },
      trigger,
    });

    useNotificationStore.getState().addMeasurementNotification(data.id);
  };

  /** Show a one-off notification now or in N seconds, or at a Date */
  const showNotification = async (body: string, triggerAt?: number | Date | null) => {
    try {
      if (Platform.OS === "android") {
        await ensureAndroidChannel();
      }
      const identifier = await Notifications.scheduleNotificationAsync({
        content: { title: NOTIFICATION_TITLE, body },
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

      await Notifications.cancelScheduledNotificationAsync(
        NotificationIdentifiers.OLD_DAILY_WEIGH_IN_REMINDER_ID
      ); // Remove old notification schedule for legacy users - MUST

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      let alreadyScheduledWeightIn = false;
      let alreadyScheduledMeasurement = false;

      for (const n of scheduled) {
        if (n.identifier === NotificationIdentifiers.NEW_DAILY_WEIGH_IN_REMINDER_ID) {
          alreadyScheduledWeightIn = true;
        }
        if (n.identifier === NotificationIdentifiers.WEEKLY_MEASUERMENT_REMINDER_ID) {
          alreadyScheduledMeasurement = true;
        }

        // Early exit if both are already scheduled
        if (alreadyScheduledWeightIn && alreadyScheduledMeasurement) break;
      }

      if (!alreadyScheduledMeasurement) {
        await scheduleWeeklyMeasurementReminder();
      }

      if (!alreadyScheduledWeightIn) {
        await scheduleDailyWeightInReminder();
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
        const { data }: { data: { id: string } } = n.request.content;

        useNotificationStore.getState().updateNotificationStatus(data.id);
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
    scheduleDailyWeightInReminder,
    scheduleWeeklyMeasurementReminder,
    notificationReceivedListener,
  };
};

export default useNotification;

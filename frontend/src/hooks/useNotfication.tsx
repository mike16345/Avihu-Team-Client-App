import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const useNotification = () => {
  const now = new Date();
  const triggerTime = new Date();
  triggerTime.setHours(8, 0, 0, 0);

  if (now > triggerTime) {
    triggerTime.setDate(triggerTime.getDate() + 1);
  }

  const triggerInSeconds = Math.round((triggerTime.getTime() - now.getTime()) / 1000);

  const androidTrigger = {
    seconds: triggerInSeconds,
  };

  const iosTrigger = {
    hour: 8,
    minute: 0,
    timezone: `Asia/Jerusalem`,
    repeats: true,
  };

  // Set the global notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Request notification permissions
  const requestPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        alert(`The app will run better with notifcations on!`);
      }
    }
  };

  // Schedule a repeating notification
  const scheduleNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Avihu Team",
          body: "לא לשכוח לשלוח את השקילה היומית שלכם!",
        },
        trigger: Platform.OS == `ios` ? iosTrigger : androidTrigger,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const showNotification = async (body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Avihu Team",
          body,
        },
        trigger: null,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Check if notifications are already scheduled to prevent duplicates
  const initializeNotifications = async () => {
    try {
      if (Platform.OS == `android`) {
        Notifications.cancelAllScheduledNotificationsAsync();
      }
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      if (scheduledNotifications.length === 0) {
        await scheduleNotification();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Execute functions

  return {
    requestPermissions,
    initializeNotifications,
    showNotification,
  };
};

export default useNotification;

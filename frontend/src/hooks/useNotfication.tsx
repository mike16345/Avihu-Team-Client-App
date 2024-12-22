import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";

export const useNotification = () => {
  useEffect(() => {
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
          alert("Permission for notifications is required!");
        }
      }
    };

    // Schedule a repeating notification
    const scheduleNotification = async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "שקילה יומית",
          body: "לא לשכוח לשלוח את השקילה היומית שלכם!",
        },
        trigger: {
          hour: 9, // Set the desired time (9:00 AM here)
          minute: 0,
          repeats: true, // Ensure it repeats daily
        },
      });
    };

    // Check if notifications are already scheduled to prevent duplicates
    const initializeNotifications = async () => {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      if (scheduledNotifications.length === 0) {
        await scheduleNotification();
      }
    };

    // Execute functions
    requestPermissions().then(() => {
      initializeNotifications();
    });
  }, []);
};

export default useNotification;

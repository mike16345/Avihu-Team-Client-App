import * as Notifications from "expo-notifications";

export const useNotification = () => {
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
          title: "שקילה יומית",
          body: "לא לשכוח לשלוח את השקילה היומית שלכם!",
        },
        trigger: {
          hour: 9, // Set the desired time (9:00 AM here)
          minute: 0,
          timezone: `Asia/Jerusalem`,
          repeats: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Check if notifications are already scheduled to prevent duplicates
  const initializeNotifications = async () => {
    try {
      //Notifications.cancelAllScheduledNotificationsAsync();
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
  };
};

export default useNotification;

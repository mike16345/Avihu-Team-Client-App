import React from "react";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { useNotificationStore } from "@/store/notificationStore";

const BACKGROUND_TASK_NAME = "CHECK_PENDING_NOTIFICATIONS_TASK";
const FIFTEEN_MINUTES = 15 * 60;

const useBackgroundTasks = () => {
  TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    try {
      useNotificationStore.getState().updateNotificationsPastTriggerTime();

      return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
      console.error("[BackgroundTask] Failed:", error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });

  // Register periodic task to run every ~15 min
  const registerBackgroundTask = React.useCallback(async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
      if (!isRegistered) {
        await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: FIFTEEN_MINUTES,
        });
      }
    } catch (error) {
      console.error("[BackgroundTask] Registration failed:", error);
    }
  }, []);

  //  Manually trigger the same logic when app opens
  const runTaskOnAppOpen = React.useCallback(async () => {
    try {
      useNotificationStore.getState().updateNotificationsPastTriggerTime();
    } catch (error) {
      console.error("[BackgroundTask] App open task failed:", error);
    }
  }, []);

  return {
    registerBackgroundTask,
    runTaskOnAppOpen,
  };
};

export default useBackgroundTasks;

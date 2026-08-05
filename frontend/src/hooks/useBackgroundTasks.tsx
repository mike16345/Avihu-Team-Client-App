import React from "react";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { syncTodayStepsInBackground } from "@/services/backgroundStepsSync";
import { useNotificationStore } from "@/store/notificationStore";

const BACKGROUND_TASK_NAME = "AVIHU_BACKGROUND_SYNC_TASK";
const LEGACY_BACKGROUND_TASK_NAME = "CHECK_PENDING_NOTIFICATIONS_TASK";
const FIFTEEN_MINUTES = 15;

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  let failed = false;

  try {
    useNotificationStore.getState().updateNotificationsPastTriggerTime();
  } catch (error) {
    failed = true;
    console.error("[BackgroundTask] Failed to update pending notifications:", error);
  }

  try {
    await syncTodayStepsInBackground();
  } catch (error) {
    failed = true;
    console.error("[BackgroundTask] Failed to sync today's steps:", error);
  }

  return failed
    ? BackgroundTask.BackgroundTaskResult.Failed
    : BackgroundTask.BackgroundTaskResult.Success;
});

const useBackgroundTasks = () => {
  const registerBackgroundTask = React.useCallback(async () => {
    try {
      const isLegacyTaskRegistered = await TaskManager.isTaskRegisteredAsync(
        LEGACY_BACKGROUND_TASK_NAME,
      );
      if (isLegacyTaskRegistered) {
        await BackgroundTask.unregisterTaskAsync(LEGACY_BACKGROUND_TASK_NAME);
      }

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

export type DeveloperNotificationPermission = "granted" | "denied" | "undetermined";

export type DeveloperActionName = "permission" | "notification" | "settings" | "cache" | "reload";

export interface DeveloperActionResult {
  ok: boolean;
  message: string;
}

export interface DeveloperPermissionResult extends DeveloperActionResult {
  permission: DeveloperNotificationPermission;
}

export interface DeveloperActionDependencies {
  getNotificationPermission(): Promise<DeveloperNotificationPermission>;
  requestNotificationPermission(): Promise<DeveloperNotificationPermission>;
  scheduleTestNotification(title: string, body: string): Promise<string | undefined>;
  openNotificationSettings(): Promise<void>;
  clearMemoryQueryCache(): void;
  clearPersistedQueryCache(): Promise<void>;
  reloadApp(): Promise<void>;
  reportFailure(action: DeveloperActionName): void;
}

export interface DeveloperActions {
  refreshNotificationPermission(): Promise<DeveloperPermissionResult>;
  requestNotificationPermission(): Promise<DeveloperPermissionResult>;
  sendTestNotification(title: string): Promise<DeveloperActionResult>;
  openNotificationSettings(): Promise<DeveloperActionResult>;
  clearServerCache(): Promise<DeveloperActionResult>;
  reloadApp(): Promise<DeveloperActionResult>;
}

const TEST_NOTIFICATION_BODY = "Developer test notification";

export const createDeveloperActions = (
  dependencies: DeveloperActionDependencies
): DeveloperActions => {
  const reportFailure = (action: DeveloperActionName, message: string): DeveloperActionResult => {
    dependencies.reportFailure(action);
    return { ok: false, message };
  };

  return {
    refreshNotificationPermission: async () => {
      try {
        const permission = await dependencies.getNotificationPermission();
        return {
          ok: true,
          message: "Notification permission refreshed.",
          permission,
        };
      } catch {
        return {
          ...reportFailure("permission", "Notification permission could not be checked."),
          permission: "undetermined",
        };
      }
    },
    requestNotificationPermission: async () => {
      try {
        const permission = await dependencies.requestNotificationPermission();
        const granted = permission === "granted";
        return {
          ok: granted,
          message: granted
            ? "Notification permission granted."
            : "Notification permission was not granted.",
          permission,
        };
      } catch {
        return {
          ...reportFailure("permission", "Notification permission could not be requested."),
          permission: "undetermined",
        };
      }
    },
    sendTestNotification: async (title) => {
      try {
        const permission = await dependencies.getNotificationPermission();
        if (permission !== "granted") {
          return { ok: false, message: "Notification permission is not granted." };
        }

        const identifier = await dependencies.scheduleTestNotification(
          title,
          TEST_NOTIFICATION_BODY
        );
        if (!identifier) {
          return { ok: false, message: "Test notification could not be scheduled." };
        }

        return { ok: true, message: "Test notification scheduled." };
      } catch {
        return reportFailure("notification", "Test notification could not be scheduled.");
      }
    },
    openNotificationSettings: async () => {
      try {
        await dependencies.openNotificationSettings();
        return { ok: true, message: "Notification settings opened." };
      } catch {
        return reportFailure("settings", "Notification settings could not be opened.");
      }
    },
    clearServerCache: async () => {
      try {
        dependencies.clearMemoryQueryCache();
        await dependencies.clearPersistedQueryCache();
        return { ok: true, message: "Server cache cleared." };
      } catch {
        return reportFailure("cache", "Server cache could not be cleared.");
      }
    },
    reloadApp: async () => {
      try {
        await dependencies.reloadApp();
        return { ok: true, message: "App reload requested." };
      } catch {
        return reportFailure("reload", "The app could not be reloaded.");
      }
    },
  };
};

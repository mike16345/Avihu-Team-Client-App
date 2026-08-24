import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Linking } from "react-native";

import persister from "@/QueryClient/queryPersister";
import { getRuntimeTenantDisplayName } from "@/config/runtimeTenant";
import useNotification from "@/hooks/useNotification";

import {
  createDeveloperActions,
  type DeveloperActionName,
  type DeveloperActionResult,
  type DeveloperNotificationPermission,
  type DeveloperPermissionResult,
} from "./actions";

const ACTION_BUSY_RESULT: DeveloperActionResult = {
  ok: false,
  message: "Another developer action is already running.",
};

const normalizePermission = (
  status: Notifications.PermissionStatus
): DeveloperNotificationPermission => {
  if (status === Notifications.PermissionStatus.GRANTED) return "granted";
  if (status === Notifications.PermissionStatus.DENIED) return "denied";
  return "undetermined";
};

export interface DeveloperToolActionState {
  permission: DeveloperNotificationPermission;
  runningAction: DeveloperActionName | null;
  refreshNotificationPermission(): Promise<DeveloperPermissionResult>;
  requestNotificationPermission(): Promise<DeveloperPermissionResult>;
  sendTestNotification(): Promise<DeveloperActionResult>;
  openNotificationSettings(): Promise<DeveloperActionResult>;
  clearServerCache(): Promise<DeveloperActionResult>;
  reloadApp(): Promise<DeveloperActionResult>;
}

export const useDeveloperToolActions = (open: boolean): DeveloperToolActionState => {
  const queryClient = useQueryClient();
  const { requestPermissions, showNotification } = useNotification();
  const showNotificationRef = useRef(showNotification);
  const requestPermissionsRef = useRef(requestPermissions);
  const activeActionRef = useRef<DeveloperActionName | null>(null);
  const [permission, setPermission] = useState<DeveloperNotificationPermission>("undetermined");
  const [runningAction, setRunningAction] = useState<DeveloperActionName | null>(null);

  showNotificationRef.current = showNotification;
  requestPermissionsRef.current = requestPermissions;

  const actions = useMemo(
    () =>
      createDeveloperActions({
        getNotificationPermission: async () => {
          const response = await Notifications.getPermissionsAsync();
          return normalizePermission(response.status);
        },
        requestNotificationPermission: async () => {
          const status = await requestPermissionsRef.current({ showDeniedAlert: false });
          return normalizePermission(status);
        },
        scheduleTestNotification: (title, body) =>
          showNotificationRef.current(body, 1, { developerTool: true }, title),
        openNotificationSettings: () => Linking.openSettings(),
        clearMemoryQueryCache: () => queryClient.clear(),
        clearPersistedQueryCache: async () => {
          await persister.removeClient();
        },
        reloadApp: () => Updates.reloadAsync(),
        reportFailure: (action) => {
          console.error(`[developer-tools] ${action} failed`);
        },
      }),
    [queryClient]
  );

  const execute = useCallback(
    async <T extends DeveloperActionResult>(
      action: DeveloperActionName,
      operation: () => Promise<T>,
      busyResult: T
    ): Promise<T> => {
      if (activeActionRef.current) {
        return busyResult;
      }

      activeActionRef.current = action;
      setRunningAction(action);
      try {
        return await operation();
      } finally {
        activeActionRef.current = null;
        setRunningAction(null);
      }
    },
    []
  );

  const refreshNotificationPermission = useCallback(async () => {
    const result = await actions.refreshNotificationPermission();
    setPermission(result.permission);
    return result;
  }, [actions]);

  const requestNotificationPermission = useCallback(
    () =>
      execute(
        "permission",
        async () => {
          const result = await actions.requestNotificationPermission();
          setPermission(result.permission);
          return result;
        },
        {
          ...ACTION_BUSY_RESULT,
          permission,
        }
      ),
    [actions, execute, permission]
  );

  const sendTestNotification = useCallback(
    () =>
      execute(
        "notification",
        () => actions.sendTestNotification(getRuntimeTenantDisplayName(Constants)),
        ACTION_BUSY_RESULT
      ),
    [actions, execute]
  );

  const openNotificationSettings = useCallback(
    () => execute("settings", actions.openNotificationSettings, ACTION_BUSY_RESULT),
    [actions, execute]
  );

  const clearServerCache = useCallback(
    () => execute("cache", actions.clearServerCache, ACTION_BUSY_RESULT),
    [actions, execute]
  );

  const reloadApp = useCallback(
    () => execute("reload", actions.reloadApp, ACTION_BUSY_RESULT),
    [actions, execute]
  );

  useEffect(() => {
    if (!open) return;

    void refreshNotificationPermission();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshNotificationPermission();
      }
    });

    return () => subscription.remove();
  }, [open, refreshNotificationPermission]);

  return {
    permission,
    runningAction,
    refreshNotificationPermission,
    requestNotificationPermission,
    sendTestNotification,
    openNotificationSettings,
    clearServerCache,
    reloadApp,
  };
};

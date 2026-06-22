import queryClient from "@/QueryClient/queryClient";
import { clearAuthSession } from "@/services/authSession";
import { useNotificationStore } from "@/store/notificationStore";
import { useUserStore } from "@/store/userStore";

let logoutPromise: Promise<void> | null = null;

export const clearLocalAuthState = async () => {
  useUserStore.getState().setCurrentUser(null);
  await clearAuthSession();
  queryClient.clear();
  useNotificationStore.getState().clearNotifications();
};

export const forceLogoutFromAuthError = async () => {
  if (logoutPromise) {
    return logoutPromise;
  }

  logoutPromise = (async () => {
    try {
      await clearLocalAuthState();
    } finally {
      logoutPromise = null;
    }
  })();

  return logoutPromise;
};

import queryClient from "@/QueryClient/queryClient";
import { clearAuthSession } from "@/services/authSession";
import { useNotificationStore } from "@/store/notificationStore";
import { useToastStore } from "@/store/toastStore";
import { useUserStore } from "@/store/userStore";
import { errorNotificationHaptic } from "@/utils/haptics";

let logoutPromise: Promise<void> | null = null;

export const clearLocalAuthState = async () => {
  useUserStore.getState().setCurrentUser(null);
  await clearAuthSession();
  queryClient.clear();
  useNotificationStore.getState().clearNotifications();
};

const showSessionExpiredToast = () => {
  errorNotificationHaptic();

  useToastStore.getState().showToast({
    title: "התחברות פגה",
    message: "יש להתחבר מחדש כדי להמשיך",
    type: "error",
  });
};

export const forceLogoutFromAuthError = async () => {
  if (logoutPromise) {
    return logoutPromise;
  }

  logoutPromise = (async () => {
    try {
      await clearLocalAuthState();
      showSessionExpiredToast();
    } finally {
      logoutPromise = null;
    }
  })();

  return logoutPromise;
};

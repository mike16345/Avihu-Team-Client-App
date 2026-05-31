import { logoutRefreshSession } from "@/API/authApi";
import { clearAuthSession, getRefreshToken } from "@/services/authSession";
import { useNotificationStore } from "@/store/notificationStore";
import { useUserStore } from "@/store/userStore";
import { useQueryClient } from "@tanstack/react-query";

const useLogout = () => {
  const queryClient = useQueryClient();
  const { setCurrentUser } = useUserStore();
  const { clearNotifications } = useNotificationStore();

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();

    setCurrentUser(null);
    await clearAuthSession();
    queryClient.clear();
    queryClient.invalidateQueries();
    clearNotifications();
    if (refreshToken) {
      try {
        await logoutRefreshSession(refreshToken);
      } catch (error) {
        console.error("Failed to logout auth session", error);
      }
    }
  };

  return { handleLogout };
};

export default useLogout;

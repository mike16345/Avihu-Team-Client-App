import { logoutRefreshSession } from "@/API/authApi";
import { getRefreshToken } from "@/services/authSession";
import { clearLocalAuthState } from "@/services/authLogout";

const useLogout = () => {
  const handleLogout = async () => {
    const refreshToken = getRefreshToken();

    await clearLocalAuthState();
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

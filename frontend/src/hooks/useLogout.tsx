import { reportError } from "@/services/errorReporting/reportError";
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
        reportError(error, { operation: "useLogout.handleLogout" });
      }
    }
  };

  return { handleLogout };
};

export default useLogout;

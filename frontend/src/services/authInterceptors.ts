import { AxiosInstance } from "axios";
import { shouldForceLogout } from "@/services/authErrors";
import { forceLogoutFromAuthError } from "@/services/authLogout";

export const attachAuthErrorInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (shouldForceLogout(error)) {
        await forceLogoutFromAuthError();
      }

      return Promise.reject(error);
    }
  );

  return client;
};

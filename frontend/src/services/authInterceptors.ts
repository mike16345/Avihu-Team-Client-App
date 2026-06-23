import { NEW_ACCESS_TOKEN_HEADER } from "@/constants/auth";
import { shouldForceLogout } from "@/services/authErrors";
import { forceLogoutFromAuthError } from "@/services/authLogout";
import { setAuthSession } from "@/services/authSession";
import { AxiosInstance, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

const getRenewedAccessToken = (
  headers: AxiosResponseHeaders | Partial<RawAxiosResponseHeaders> | undefined
) => {
  if (!headers) {
    return undefined;
  }

  const normalizedHeaders = headers as Record<string, unknown> & {
    get?: (name: string) => unknown;
  };

  const headerValue =
    normalizedHeaders[NEW_ACCESS_TOKEN_HEADER] ??
    normalizedHeaders[NEW_ACCESS_TOKEN_HEADER.toLowerCase()] ??
    normalizedHeaders["X-New-Access-Token"] ??
    normalizedHeaders.get?.(NEW_ACCESS_TOKEN_HEADER);

  return typeof headerValue === "string" ? headerValue : undefined;
};

export const attachAuthErrorInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    async (response) => {
      const renewedAccessToken = getRenewedAccessToken(response.headers);

      if (renewedAccessToken) {
        await setAuthSession({ nextAccessToken: renewedAccessToken });
      }

      return response;
    },
    async (error) => {
      if (shouldForceLogout(error)) {
        await forceLogoutFromAuthError();
      }

      return Promise.reject(error);
    }
  );

  return client;
};

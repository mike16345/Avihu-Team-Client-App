import { getApiBaseUrl } from "@/config/apiConfig";
import { LoginResponse, MeResponse, RefreshResponse } from "@/interfaces/IAuth";
import { getAccessToken } from "@/services/authSession";
import { API_KEY_HEADER, getApiKey } from "@/services/apiKey";
import { ApiResponse } from "@/types/ApiTypes";
import axios from "axios";

const AUTH_ENDPOINT = "users/auth";

const authClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 25000,
});

authClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();

  config.headers = config.headers ?? {};

  if (apiKey && !config.headers[API_KEY_HEADER]) {
    config.headers[API_KEY_HEADER] = apiKey;
  }

  return config;
});

const unwrapAuthResponse = <T>(responseBody: T | ApiResponse<T>) => {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "data" in responseBody &&
    responseBody.data !== undefined
  ) {
    return responseBody.data as T;
  }

  return responseBody as T;
};

export const loginWithPassword = async (email: string, password: string) => {
  const response = await authClient.post<ApiResponse<LoginResponse> | LoginResponse>(
    `${AUTH_ENDPOINT}/login`,
    {
      email,
      password,
    }
  );

  return unwrapAuthResponse<LoginResponse>(response.data);
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await authClient.post<ApiResponse<RefreshResponse> | RefreshResponse>(
    `${AUTH_ENDPOINT}/refresh`,
    {
      refreshToken,
    }
  );

  return unwrapAuthResponse<RefreshResponse>(response.data);
};

export const logoutRefreshSession = async (refreshToken: string) => {
  const accessToken = getAccessToken();

  await authClient.post(
    `${AUTH_ENDPOINT}/logout`,
    { refreshToken },
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined
  );
};

export const getCurrentAuthUser = async () => {
  const accessToken = getAccessToken();
  const response = await authClient.get<ApiResponse<MeResponse> | MeResponse>(
    `${AUTH_ENDPOINT}/me`,
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  return unwrapAuthResponse<MeResponse>(response.data);
};

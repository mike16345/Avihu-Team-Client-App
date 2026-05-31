import { API_KEY_HEADER, getApiKey } from "@/services/apiKey";
import { getAccessToken, loadPersistedAuthSession } from "@/services/authSession";
import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";

const isExpo = process.env.EXPO_PUBLIC_MODE == "development";
const isPreview = !!Constants?.expoConfig?.extra?.API_URL_PREVIEW;

export const getApiBaseUrl = () =>
  isPreview
    ? Constants?.expoConfig?.extra?.API_URL_PREVIEW
    : isExpo
      ? process.env.EXPO_PUBLIC_SERVER
      : Constants?.expoConfig?.extra?.API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
});

let hasLoadedPersistedSession = false;
let authSessionLoadPromise: Promise<void> | null = null;

const ensureAuthSessionLoaded = async () => {
  if (hasLoadedPersistedSession) return;

  if (!authSessionLoadPromise) {
    authSessionLoadPromise = loadPersistedAuthSession()
      .then(() => {
        hasLoadedPersistedSession = true;
      })
      .finally(() => {
        authSessionLoadPromise = null;
      });
  }

  await authSessionLoadPromise;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const apiKey = getApiKey();

    config.headers = config.headers ?? {};

    if (apiKey && !config.headers[API_KEY_HEADER]) {
      config.headers[API_KEY_HEADER] = apiKey;
    }

    let accessToken = getAccessToken();

    if (!accessToken) {
      await ensureAuthSessionLoaded();
      accessToken = getAccessToken();
    }

    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

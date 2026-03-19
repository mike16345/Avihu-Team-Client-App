import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";

const isExpo = process.env.EXPO_PUBLIC_MODE == "development";
const isPreview = !!Constants?.expoConfig?.extra?.API_URL_PREVIEW;

const URL = isPreview
  ? Constants?.expoConfig?.extra?.API_URL_PREVIEW
  : isExpo
    ? process.env.EXPO_PUBLIC_SERVER
    : Constants?.expoConfig?.extra?.API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: URL,
  timeout: 60000,
});

export default axiosInstance;

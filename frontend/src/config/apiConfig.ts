import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";

const isDevMode = process.env.EXPO_PUBLIC_MODE == "development";
const SERVER = isDevMode ? process.env.EXPO_PUBLIC_SERVER : Constants?.expoConfig?.extra?.API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 10000,
});

export default axiosInstance;

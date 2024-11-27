import axios, { AxiosInstance } from "axios";

const isDevMode = process.env.EXPO_PUBLIC_MODE == "development";
const SERVER = isDevMode ? process.env.EXPO_PUBLIC_SERVER : process.env.API_URL;
console.log("ENVIRONMENT VALUES", Object.values(process.env));
console.log("AVIHU TEAM server", SERVER);
console.log("AVIHU TEAM API url", process.env.API_URL);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 10000,
});

export default axiosInstance;

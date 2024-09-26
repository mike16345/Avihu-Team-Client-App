import axios, { AxiosInstance } from "axios";

const SERVER = process.env.EXPO_PUBLIC_SERVER;
const auth = process.env.EXPO_PUBLIC_API_AUTH_TOKEN;

console.log("Server", SERVER);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 10000,
});

export default axiosInstance;

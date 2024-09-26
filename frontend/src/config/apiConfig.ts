import axios, { AxiosInstance } from "axios";

const SERVER = process.env.VITE_SERVER;

console.log("Server", SERVER);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 10000,
});

export default axiosInstance;

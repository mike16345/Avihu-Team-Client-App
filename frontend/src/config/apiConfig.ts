import axios, { AxiosInstance } from "axios";

const IP_ADDRESS = process.env.EXPO_PUBLIC_SERVER_URL;
const PORT = process.env.EXPO_PUBLIC_SERVER_PORT;

console.log("Ip address", IP_ADDRESS);
console.log("Port", PORT);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `http://${IP_ADDRESS}:${PORT}`,
  timeout: 10000,
});

export default axiosInstance;

import axios, { AxiosInstance } from "axios";
import { IP_ADDRESS } from "../../ip";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `http://${IP_ADDRESS}:3002`,
  timeout: 10000,
});

export default axiosInstance;

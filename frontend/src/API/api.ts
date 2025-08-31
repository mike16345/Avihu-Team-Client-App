import axiosInstance from "@/config/apiConfig";
import { Method } from "axios";
import Constants from "expo-constants";

const isDevMode = process.env.EXPO_PUBLIC_MODE == "development";
const API_AUTH_TOKEN = isDevMode
  ? process.env.EXPO_PUBLIC_API_AUTH_TOKEN
  : Constants?.expoConfig?.extra?.API_TOKEN;

async function request<T>(
  method: Method,
  endpoint: string,
  data?: any,
  params?: any,
  headers?: any
): Promise<T> {
  try {
    const request = {
      method,
      url: endpoint,
      data,
      params,
      headers: { ["X-Api-Key"]: API_AUTH_TOKEN, ...headers },
    };
    console.log("AVIHU TEAM request", JSON.stringify(request, undefined, 2));
    const response = await axiosInstance.request<T>(request);

    return response.data;
  } catch (error: any) {
    console.error("Error Status Code:", error?.response?.status || "unknown");
    console.error("Error Message:", error?.response?.data?.message || "unknown");

    throw error;
  }
}

export async function fetchData<T>(endpoint: string, params?: any, headers?: any): Promise<T> {
  return request<T>("get", endpoint, undefined, params, headers);
}

export async function sendData<T>(endpoint: string, data: any, headers?: any): Promise<T> {
  return request<T>("post", endpoint, data, undefined, headers);
}

export async function updateItem<T>(
  endpoint: string,
  data: any,
  headers?: any,
  params?: any
): Promise<T> {
  return request<T>("put", endpoint, data, params, headers);
}
export async function patchItem<T>(endpoint: string, params?: any, headers?: any): Promise<T> {
  return request<T>("patch", endpoint, undefined, params, headers);
}

export async function deleteItem<T>(
  endpoint: string,
  params?: any,
  headers?: any,
  data?: any
): Promise<T> {
  return request<T>("delete", `${endpoint}`, data, params, headers);
}

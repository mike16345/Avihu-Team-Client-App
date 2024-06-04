import axiosInstance from "@/config/apiConfig";
import { Method } from "axios";

async function request<T>(
  method: Method,
  endpoint: string,
  data?: any,
  params?: any,
  headers?: any
): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      method,
      url: endpoint,
      data,
      params,
      headers,
    });

    return response.data;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

export async function fetchData<T>(endpoint: string, params?: any, headers?: any): Promise<T> {
  return request<T>("get", endpoint, undefined, params, headers);
}

export async function sendData<T>(endpoint: string, data: any, headers?: any): Promise<T> {
  return request<T>("post", endpoint, data, undefined, headers);
}

export async function updateItem<T>(endpoint: string, data: any, headers?: any): Promise<T> {
  return request<T>("put", endpoint, data, undefined, headers);
}

export async function deleteItem<T>(endpoint: string, id: string, headers?: any): Promise<T> {
  return request<T>("delete", `${endpoint}/${id}`, undefined, undefined, headers);
}

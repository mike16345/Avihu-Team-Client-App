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
    const request = {
      method,
      url: endpoint,
      data,
      params,
      headers,
    };

    const response = await axiosInstance.request<T>(request);

    return response.data;
  } catch (error: any) {
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

export function getErrorStatus(error: any): number | undefined {
  return error?.status ?? error?.response?.status;
}

export function isNotFoundError(error: any): boolean {
  return getErrorStatus(error) === 404;
}

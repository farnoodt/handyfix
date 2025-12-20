import axios from "axios";
import { ApiError, ApiResponse } from "./types";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (window as any).__ENV__?.API_BASE_URL ||
  "https://localhost:5001/api";

export const http = axios.create({
  baseURL,
  withCredentials: false
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("handyfix_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function unwrap<T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const res = await p;
    if (!res.data.ok) throw new ApiError(res.data.error || "Request failed");
    if (res.data.data === null) throw new ApiError("No data returned");
    return res.data.data;
  } catch (err: any) {
    const status = err?.response?.status as number | undefined;
    const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
    const msg = apiMsg || err?.message || "Request failed";
    throw new ApiError(msg, status);
  }
}

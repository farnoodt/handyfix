import axios from "axios";
import { ApiError, type ApiResponse } from "./types";

let tokenKey = "handyfix_token";

export const http = axios.create({ baseURL: "https://localhost:5001/api" });

export function configureApiClient(opts?: { baseURL?: string; tokenStorageKey?: string }) {
  if (opts?.baseURL) http.defaults.baseURL = opts.baseURL;
  if (opts?.tokenStorageKey) tokenKey = opts.tokenStorageKey;
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
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
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Request failed";
    throw new ApiError(msg, status);
  }
}

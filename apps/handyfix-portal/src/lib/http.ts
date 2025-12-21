const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

function getToken() {
  return localStorage.getItem("hf_token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw { status: 0, message: "VITE_API_BASE_URL is not set" } as ApiError;
  }

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  // No content
  if (res.status === 204) return undefined as T;

  // Try parse JSON (fallback to text)
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.title)) ||
      res.statusText ||
      "Request failed";

    throw {
      status: res.status,
      message,
      details: data ?? text,
    } as ApiError;
  }

  return (data ?? ({} as T)) as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

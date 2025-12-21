// packages/api-client/src/http.ts

let accessToken: string | null = null;
let baseUrl = ""; // optional prefix for all relative URLs

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setBaseUrl(url: string) {
  baseUrl = (url || "").replace(/\/+$/, "");
}

function resolveUrl(url: string) {
  // absolute URL -> leave it
  if (/^https?:\/\//i.test(url)) return url;

  if (!baseUrl) return url;

  // join baseUrl + url
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function buildHeaders(initHeaders?: HeadersInit, body?: unknown) {
  const headers = new Headers(initHeaders);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // If it's FormData, DO NOT set Content-Type (browser will set boundary)
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (isFormData) {
    // If caller set it, remove it to avoid missing boundary issues
    if (headers.has("Content-Type")) headers.delete("Content-Type");
    return headers;
  }

  // Default JSON content-type when body is a plain object and caller didn't set it
  if (body !== undefined && body !== null) {
    const isString = typeof body === "string";
    if (!isString && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  return headers;
}

function buildBody(body?: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (typeof body === "string") return body;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (isFormData) return body as FormData;

  // default JSON
  return JSON.stringify(body);
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data: any = await res.json();
        msg = data?.message || data?.error || msg;
      } else {
        const text = await res.text();
        if (text) msg = text;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as unknown as T;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }

  // fallback for non-json responses
  return (await res.text()) as unknown as T;
}

/**
 * apiFetch<T> returns parsed JSON (or text), with auth header attached.
 */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(resolveUrl(url), {
    ...init,
    headers: buildHeaders(init.headers, init.body),
  });
  return parseResponse<T>(res);
}

/**
 * http.* methods return parsed JSON (typed) to match your existing usage:
 * unwrap(http.get<ApiResponse<T>>(...))
 */
export const http = {
  get: async <T>(url: string, init: RequestInit = {}) =>
    apiFetch<T>(url, { ...init, method: "GET" }),

  delete: async <T>(url: string, init: RequestInit = {}) =>
    apiFetch<T>(url, { ...init, method: "DELETE" }),

  post: async <T>(url: string, body?: unknown, init: RequestInit = {}) =>
    apiFetch<T>(url, {
      ...init,
      method: "POST",
      headers: buildHeaders(init.headers, body),
      body: buildBody(body),
    }),

  put: async <T>(url: string, body?: unknown, init: RequestInit = {}) =>
    apiFetch<T>(url, {
      ...init,
      method: "PUT",
      headers: buildHeaders(init.headers, body),
      body: buildBody(body),
    }),

  patch: async <T>(url: string, body?: unknown, init: RequestInit = {}) =>
    apiFetch<T>(url, {
      ...init,
      method: "PATCH",
      headers: buildHeaders(init.headers, body),
      body: buildBody(body),
    }),
};

/**
 * unwrap() keeps your current pattern working:
 * unwrap<T>(http.get<ApiResponse<T>>(...))
 *
 * It supports common response wrappers: { data }, { result }, { value }.
 * If response is already T, it returns it as-is.
 */
export async function unwrap<T>(p: Promise<any> | any): Promise<T> {
  const r = await p;

  if (r && typeof r === "object") {
    // Optional error convention support
    if (r.success === false) {
      throw new Error(r.message || r.error || "Request failed");
    }

    if ("data" in r) return (r as any).data as T;
    if ("result" in r) return (r as any).result as T;
    if ("value" in r) return (r as any).value as T;
  }

  return r as T;
}

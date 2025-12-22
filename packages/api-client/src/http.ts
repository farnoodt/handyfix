// packages/api-client/src/http.ts

let accessToken: string | null = null;
let baseUrl = ""; // optional prefix for all relative URLs

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

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

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (isFormData) {
    if (headers.has("Content-Type")) headers.delete("Content-Type");
    return headers;
  }

  // If body is a plain object, default to JSON content type
  const hasBody = body !== undefined && body !== null;
  const isPlainObject =
    typeof body === "object" &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams);

  if (hasBody && isPlainObject && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function buildBody(body?: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (typeof body === "string") return body;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (isFormData) return body as FormData;

  // JSON for objects/numbers/booleans/arrays
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

    if (res.status === 401) {
      onUnauthorized?.();
    }

    throw new HttpError(res.status, msg);
  }

  if (res.status === 204) return undefined as unknown as T;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}


/**
 * apiFetch<T> returns parsed JSON (or text), with auth header attached.
 */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(init.headers, init.body);

  // If body is a string and caller didn't set Content-Type,
  // assume JSON when it looks like JSON.
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    const s = init.body.trim();
    if (s.startsWith("{") || s.startsWith("[")) {
      headers.set("Content-Type", "application/json");
    } else {
      headers.set("Content-Type", "text/plain");
    }
  }

  const res = await fetch(resolveUrl(url), {
    ...init,
    headers,
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

export type ConfigureApiClientOptions = {
  // Support both spellings
  baseUrl?: string;
  baseURL?: string;

  // Optional: allow main.tsx to define where token lives
  tokenStorageKey?: string;

  // Optional direct token override
  token?: string | null;

  // Global unauthorized callback
  onUnauthorized?: (() => void) | null;
};

let configuredTokenStorageKey: string | null = null;

export function configureApiClient(opts: ConfigureApiClientOptions) {
  const url = opts.baseUrl ?? opts.baseURL;
  if (url !== undefined) setBaseUrl(url);

  if (opts.tokenStorageKey) {
    configuredTokenStorageKey = opts.tokenStorageKey;
  }

  if (opts.onUnauthorized !== undefined) {
    setUnauthorizedHandler(opts.onUnauthorized);
  }

  // If token explicitly provided, use it.
  if (opts.token !== undefined) {
    setAccessToken(opts.token);
    return;
  }

  // Otherwise, if tokenStorageKey provided, try to load token from localStorage.
  if (configuredTokenStorageKey) {
    try {
      const t = localStorage.getItem(configuredTokenStorageKey);
      setAccessToken(t);
    } catch {
      // ignore
    }
  }
}

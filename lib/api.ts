/**
 * Centralized API client for yuva-frontend → Express backend
 * Base URL: http://localhost:5000/api
 * - Attaches Bearer access token from in-memory store
 * - Sends cookies (credentials: 'include') for httpOnly refresh token
 * - On 401, attempts silent token refresh once, then retries
 * - Throws ApiError with { message, status, errors? } shape
 */

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>[];

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string>[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ─── In-memory token store ────────────────────────────────────────────────────
// Access token lives here (never in localStorage/sessionStorage for security)
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string | null) => {
    _accessToken = token;
  },
  clear: () => {
    _accessToken = null;
  },
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends httpOnly refresh-token cookie
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken) {
      tokenStore.set(data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
  _retrying = false,
): Promise<T> {
  const { body, params, headers: extraHeaders, ...rest } = options;

  // Build URL with query params
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  const headers: Record<string, string> = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  };

  const token = tokenStore.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...rest,
    credentials: "include",
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // Silent refresh on 401
  if (res.status === 401 && !_retrying) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
    tokenStore.clear();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  // Parse JSON (even on error responses)
  let data: unknown;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const d = data as { message?: string; errors?: Record<string, string>[] };
    throw new ApiError(
      d?.message ?? `Request failed (${res.status})`,
      res.status,
      d?.errors,
    );
  }

  return data as T;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(path: string, params?: RequestOptions["params"]) =>
    apiFetch<T>(path, { method: "GET", params }),

  post: <T = unknown>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body }),

  delete: <T = unknown>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};

// ─── Pagination meta type (shared across modules) ────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

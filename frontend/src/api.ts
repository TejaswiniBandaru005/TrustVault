/**
 * TrustVault Type-Safe API Client
 */

// Support VITE_API_BASE_URL, BACKEND_API_BASE_URL (from Vercel env), or VITE_BACKEND_URL
const rawBaseUrl: string =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.BACKEND_API_BASE_URL ||
  (import.meta as any).env?.VITE_BACKEND_URL ||
  "";

// Strip trailing slash so `${apiBaseUrl}${path}` won't produce double slashes like `https://...//api/...`
const apiBaseUrl: string = typeof rawBaseUrl === "string" ? rawBaseUrl.replace(/\/+$/, "") : "";

export interface ApiRequestOptions extends Omit<RequestInit, "headers" | "body"> {
  headers?: Record<string, string>;
  body?: any;
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = { ...(options.headers || {}) };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

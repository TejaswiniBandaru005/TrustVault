/**
 * TrustVault Type-Safe API Client
 */

const apiBaseUrl: string = (import.meta as any).env?.BACKEND_API_BASE_URL || "";

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

  const response = await fetch(`${apiBaseUrl}${path}`, {
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

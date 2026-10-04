/**
 * Centralized client-side fetch wrapper.
 *
 * All calls go to same-origin Next.js API proxy routes (/api/...) — never
 * directly to the backend. The proxy routes read the httpOnly `token` cookie
 * server-side and forward it as `Authorization: Bearer <token>` to the backend,
 * so the JWT token is never exposed to client-side JavaScript.
 *
 * Usage:
 *   import { apiClient } from "@/lib/apiClient";
 *   const data = await apiClient.post<TransactionResponse>(
 *     API_ROUTES.transaction.base,
 *     payload,
 *   );
 */
import { ApiError } from "@/lib/apiError";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiError("Network error — please check your connection.", 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? (data as { message: string }).message
        : null) ?? "Request failed";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const apiClient = {
  get<T>(path: string, opts?: RequestInit): Promise<T> {
    return request<T>(path, { ...opts, method: "GET" });
  },
  post<T>(path: string, body: unknown, opts?: RequestInit): Promise<T> {
    return request<T>(path, { ...opts, method: "POST", body: JSON.stringify(body) });
  },
  put<T>(path: string, body: unknown, opts?: RequestInit): Promise<T> {
    return request<T>(path, { ...opts, method: "PUT", body: JSON.stringify(body) });
  },
  delete<T>(path: string, opts?: RequestInit): Promise<T> {
    return request<T>(path, { ...opts, method: "DELETE" });
  },
};

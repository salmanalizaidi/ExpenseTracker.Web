/**
 * Shared server-side helper used by Next.js Route Handlers to proxy requests
 * to the .NET backend with the user's JWT attached.
 *
 * Must only be imported in server-side files (Route Handlers, Server Components).
 * Never import this from client components.
 */
import { ApiError } from "@/lib/apiError";

interface ProxyOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token: string;
  body?: unknown;
}

/**
 * Forwards a request to the backend and returns the parsed JSON response.
 * Throws `ApiError` on network failure or non-2xx status.
 */
export async function proxyToBackend<T>(
  backendPath: string,
  options: ProxyOptions,
): Promise<T> {
  const baseUrl = process.env.EXPENSE_API_BASE_URL;
  if (!baseUrl) {
    throw new ApiError("EXPENSE_API_BASE_URL is not configured", 500);
  }

  const url = `${baseUrl}${backendPath}`;
  const startedAt = Date.now();

  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    res = await fetch(url, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    const elapsed = Date.now() - startedAt;
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[proxy] Network error on ${options.method} ${url} after ${elapsed}ms: ${msg}`);
    throw new ApiError("Unable to reach the server", 502);
  }

  const elapsed = Date.now() - startedAt;
  console.log(`[proxy] ${options.method} ${url} → ${res.status} in ${elapsed}ms`);

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? (data as { message: string }).message
        : null) ?? "Request failed";
    console.error(`[proxy] Error ${res.status} from ${url}: ${message}`);
    throw new ApiError(message, res.status);
  }

  return data as T;
}

/**
 * Reads the token from the cookie store and throws a 401 ApiError if missing.
 * Call this at the top of every Route Handler that needs auth.
 */
export async function requireToken(): Promise<string> {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new ApiError("Not authenticated", 401);
  return token;
}

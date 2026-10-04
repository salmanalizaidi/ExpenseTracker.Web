import { ApiError } from "@/lib/apiError";
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { DashboardData } from "@/features/dashboard/types";

/**
 * Server-only fetcher for dashboard data.
 * Must only be called from Server Components or Next.js Route Handlers.
 */
export async function fetchDashboard(): Promise<DashboardData> {
  const token = await requireToken();
  return proxyToBackend<DashboardData>(API_ROUTES.dashboard.base, {
    method: "GET",
    token,
  });
}

export { ApiError };

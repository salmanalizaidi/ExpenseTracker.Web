import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { UserProfile } from "../types";

/**
 * Fetches the authenticated user's profile from the backend.
 * Must only be called in Server Components or Server Actions.
 */
export async function fetchProfile(): Promise<UserProfile> {
  const token = await requireToken();
  return proxyToBackend<UserProfile>(API_ROUTES.user.profile, {
    method: "GET",
    token,
  });
}

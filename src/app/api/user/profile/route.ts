import { NextResponse } from "next/server";
import { ApiError } from "@/lib/apiError";
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { UserProfile, UpdateProfilePayload } from "@/features/profile/types";

/**
 * GET /api/user/profile
 * Fetches the authenticated user's profile.
 */
export async function GET() {
  try {
    const token = await requireToken();
    const profile = await proxyToBackend<UserProfile>(API_ROUTES.user.profile, {
      method: "GET",
      token,
    });
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's profile fields and/or avatar.
 */
export async function PATCH(request: Request) {
  try {
    const token = await requireToken();
    const body: UpdateProfilePayload = await request.json();

    const updated = await proxyToBackend<UserProfile>(API_ROUTES.user.profile, {
      method: "PATCH",
      token,
      body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

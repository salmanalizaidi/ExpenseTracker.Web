import { NextResponse } from "next/server";
import { ApiError } from "@/lib/apiError";
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { ChangePasswordPayload } from "@/features/profile/types";

/**
 * POST /api/user/change-password
 * Forwards a password-change request to the backend.
 * Frontend has already validated the new password meets criteria before calling.
 */
export async function POST(request: Request) {
  try {
    const token = await requireToken();
    const body: ChangePasswordPayload = await request.json();

    await proxyToBackend<void>(API_ROUTES.user.changePassword, {
      method: "POST",
      token,
      body,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

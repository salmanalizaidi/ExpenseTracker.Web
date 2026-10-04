import { NextResponse } from "next/server";
import { ApiError } from "@/lib/apiError";
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { Category } from "@/features/categories/types";

/**
 * GET /api/category
 * Returns the authenticated user's categories from the backend.
 * Used by AddTransactionDialog to populate the category dropdown.
 */
export async function GET() {
  try {
    const token = await requireToken();

    const categories = await proxyToBackend<Category[]>(
      API_ROUTES.category.base,
      { method: "GET", token },
    );

    return NextResponse.json(categories);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

/**
 * POST /api/category
 * Creates a new category for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    const token = await requireToken();
    const body = await request.json();

    const category = await proxyToBackend<Category>(
      API_ROUTES.category.base,
      { method: "POST", token, body },
    );

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

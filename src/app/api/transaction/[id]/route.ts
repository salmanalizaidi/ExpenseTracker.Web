import { NextResponse } from "next/server";
import { ApiError } from "@/lib/apiError";
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { TransactionResponse } from "@/features/transactions/types";

/**
 * PUT /api/transaction/:id
 * Proxies an update-transaction request to the backend.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await requireToken();
    const body = await request.json();

    const transaction = await proxyToBackend<TransactionResponse>(
      API_ROUTES.transaction.byId(id),
      { method: "PUT", token, body },
    );

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/transaction/:id
 * Proxies a delete-transaction request to the backend (soft delete).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await requireToken();

    await proxyToBackend<void>(
      API_ROUTES.transaction.byId(id),
      { method: "DELETE", token },
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

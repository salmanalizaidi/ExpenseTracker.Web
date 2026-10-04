import { NextResponse } from "next/server";
import { ApiError } from "@/lib/apiError";
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { TransactionResponse } from "@/features/transactions/types";

/**
 * POST /api/transaction
 * Proxies a create-transaction request to the backend with the user's JWT.
 */
export async function POST(request: Request) {
  try {
    const token = await requireToken();
    const body = await request.json();

    const transaction = await proxyToBackend<TransactionResponse>(
      API_ROUTES.transaction.base,
      { method: "POST", token, body },
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

/**
 * GET /api/transaction
 * Proxies a list-all-transactions request to the backend.
 */
export async function GET() {
  try {
    const token = await requireToken();

    const transactions = await proxyToBackend<TransactionResponse[]>(
      API_ROUTES.transaction.base,
      { method: "GET", token },
    );

    return NextResponse.json(transactions);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}

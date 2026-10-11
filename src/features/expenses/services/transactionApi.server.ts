/**
 * Server-side data fetcher for transactions.
 * Only import from Server Components or Route Handlers.
 */
import { proxyToBackend, requireToken } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { TransactionResponse } from "@/features/transactions/types";
import type { Category } from "@/features/categories/types";

/**
 * Fetches all transactions for the authenticated user from the backend.
 * Returns an empty array on error so the page can still render.
 */
export async function fetchTransactions(): Promise<TransactionResponse[]> {
  try {
    const token = await requireToken();
    return await proxyToBackend<TransactionResponse[]>(
      API_ROUTES.transaction.base,
      { method: "GET", token },
    );
  } catch {
    return [];
  }
}

/**
 * Fetches all categories for the authenticated user from the backend.
 * Returns an empty array on error so the page can still render.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const token = await requireToken();
    return await proxyToBackend<Category[]>(
      API_ROUTES.category.base,
      { method: "GET", token },
    );
  } catch {
    return [];
  }
}

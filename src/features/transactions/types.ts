/**
 * Transaction types — mirrors the backend DTOs exactly.
 * 0 = Income, 1 = Expense (matches C# TransactionType enum).
 */
export type TransactionType = 0 | 1;

export interface CreateTransactionPayload {
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  /** ISO 8601 date-time string, e.g. "2026-10-04T00:00:00.000Z" */
  date: string;
  /** Guid string from the backend category */
  categoryId: string;
}

export interface TransactionResponse {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
}

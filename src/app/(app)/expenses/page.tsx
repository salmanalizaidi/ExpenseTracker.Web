import { ExpenseView } from "@/features/expenses/components/ExpenseView";
import { fetchTransactions, fetchCategories } from "@/features/expenses/services/transactionApi.server";

export default async function ExpensesPage() {
  const [transactions, categories] = await Promise.all([
    fetchTransactions(),
    fetchCategories(),
  ]);

  return <ExpenseView initialTransactions={transactions} categories={categories} />;
}

/**
 * 0 = Income, 1 = Expense — mirrors the C# TransactionType enum.
 */
export type TransactionType = 0 | 1;

export interface BalanceSummary {
  totalBalance: number;
  monthlySavings: number;
  lastMonthSavings: number;
}

export interface MonthlySpending {
  spent: number;
  limit: number;
  remaining: number;
  daysLeft: number;
}

export interface SavingsGoalSummary {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  progressPercent: number;
  deadline: string;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  icon?: string;
  color?: string;
  amount: number;
  percent: number;
}

export interface RecentTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  date: string;
}

export interface DashboardData {
  balance: BalanceSummary;
  monthlySpending: MonthlySpending;
  savingsGoal?: SavingsGoalSummary;
  categoryDistribution: CategoryDistribution[];
  recentTransactions: RecentTransaction[];
}

/**
 * Client-side dashboard API service.
 *
 * The main dashboard data is fetched server-side via `dashboardApi.server.ts`
 * inside the DashboardPage Server Component.  This file is the right place to
 * add any client-triggered calls — e.g. polling the recent-transactions
 * sub-endpoint after the user adds a new transaction.
 */
export const dashboardApi = {
  // Reserved for future client-side calls, e.g.:
  // async getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
  //   const res = await fetch(`/api/dashboard/transactions/recent?limit=${limit}`);
  //   if (!res.ok) throw new Error("Failed to fetch recent transactions");
  //   return res.json();
  // },
};

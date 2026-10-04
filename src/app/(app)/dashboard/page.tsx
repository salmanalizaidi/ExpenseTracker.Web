import { redirect } from "next/navigation";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { fetchDashboard } from "@/features/dashboard/services/dashboardApi.server";
import { ApiError } from "@/lib/apiError";
import { ROUTES } from "@/lib/constants";

export default async function DashboardPage() {
  try {
    const data = await fetchDashboard();
    return <DashboardView data={data} />;
  } catch (error) {
    // Unauthenticated or token expired — send back to login
    if (error instanceof ApiError && error.statusCode === 401) {
      redirect(ROUTES.LOGIN);
    }
    // Re-throw all other errors so Next.js error.tsx / ExceptionMiddleware handles them
    throw error;
  }
}

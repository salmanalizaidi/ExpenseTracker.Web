/**
 * All backend API path segments used by server fetchers and the apiClient.
 *
 * Server fetchers (*.server.ts) prepend EXPENSE_API_BASE_URL.
 * Client-side code calls same-origin Next.js proxy routes at /api/...
 *
 * IMPORTANT: The paths here are the backend paths. Next.js proxy routes
 * mirror the same paths under /api/ so they match 1:1 with the backend.
 */
export const API_ROUTES = {
  auth: {
    login:    "/api/auth/login",
    register: "/api/auth/register",
    logout:   "/api/auth/logout",
  },
  transaction: {
    base:  "/api/transaction",
    byId:  (id: string) => `/api/transaction/${id}`,
  },
  category: {
    base:  "/api/category",
    byId:  (id: string) => `/api/category/${id}`,
  },
  dashboard: {
    base:        "/api/dashboard",
    recentTxns:  "/api/dashboard/transactions/recent",
  },
  user: {
    profile: "/api/user/profile",
    changePassword: "/api/user/change-password",
  },
} as const;

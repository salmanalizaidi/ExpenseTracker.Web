export const APP_NAME = "Expense Tracker";
export const APP_TAGLINE = "Financial Wellness";

export const ROUTES = {
  LOGIN: "/login",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
  EXPENSES: "/expenses",
  BUDGET: "/budget",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: "dashboard" },
  { href: ROUTES.EXPENSES, label: "Expenses", icon: "payments" },
  { href: ROUTES.BUDGET, label: "Budget", icon: "account_balance_wallet" },
  { href: ROUTES.REPORTS, label: "Reports", icon: "bar_chart" },
] as const;

export const BOTTOM_NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Home", icon: "home" },
  { href: ROUTES.EXPENSES, label: "Expenses", icon: "account_balance_wallet" },
  { href: ROUTES.BUDGET, label: "Budget", icon: "leaderboard" },
  { href: ROUTES.REPORTS, label: "Reports", icon: "assessment" },
  { href: ROUTES.SETTINGS, label: "Settings", icon: "settings" },
] as const;

export const MOBILE_PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Overview",
  [ROUTES.EXPENSES]: "Expenses",
  [ROUTES.BUDGET]: "Budget",
  [ROUTES.REPORTS]: "Reports",
  [ROUTES.SETTINGS]: "Settings",
  [ROUTES.PROFILE]: "Profile",
};

export const SEARCH_PLACEHOLDERS: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Search transactions...",
  [ROUTES.EXPENSES]: "Search transactions...",
  [ROUTES.BUDGET]: "Search budget categories...",
  [ROUTES.REPORTS]: "Search reports...",
  [ROUTES.SETTINGS]: "Search settings...",
};

export const DEFAULT_CURRENCY = "USD";

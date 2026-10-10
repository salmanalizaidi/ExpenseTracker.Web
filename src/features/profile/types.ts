export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarBase64: string | null;
  planTier: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
  /** null = no change, "" = remove, non-empty = set new avatar */
  avatarBase64?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const DUMMY_CONNECTED_BANKS = [
  {
    id: "bank-1",
    name: "Chase Premier Checking",
    accountNumber: "4912",
    subType: "Primary Checking",
    icon: "account_balance",
    connected: true,
    syncStatus: "Connected & Synced",
    lastUpdated: "10m ago",
  },
  {
    id: "bank-2",
    name: "Silicon Valley Bank Savings",
    accountNumber: "8104",
    subType: "High-Yield Savings",
    icon: "savings",
    connected: true,
    syncStatus: "Connected",
    lastUpdated: "1h ago",
  },
  {
    id: "bank-3",
    name: "Amex Platinum Card",
    accountNumber: "3095",
    subType: "Credit Card & Daily Expense Feed",
    icon: "credit_card",
    connected: true,
    syncStatus: "Connected",
    lastUpdated: "25m ago",
  },
] as const;

"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AuthContext } from "@/providers/AuthProvider";
import { formatCurrency } from "@/features/expenses/utils/formatCurrency";
import { AddTransactionDialog } from "@/features/transactions/components/AddTransactionDialog";
import type { DashboardData, RecentTransaction } from "@/features/dashboard/types";
import { ROUTES } from "@/lib/constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

// ─── Recent Transaction Item ──────────────────────────────────────────────────

function RecentTransactionItem({ txn }: { txn: RecentTransaction }) {
  const isIncome = txn.type === 0;
  const amountPrefix = isIncome ? "+" : "-";

  return (
    <div className="group flex cursor-pointer items-center gap-md rounded-xl p-sm transition-colors hover:bg-surface-container-low">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-lg transition-colors ${
          isIncome
            ? "group-hover:bg-secondary group-hover:text-white"
            : "group-hover:bg-primary-container group-hover:text-white"
        }`}
        title={txn.categoryName}
      >
        {txn.categoryIcon ?? <Icon name="payments" />}
      </div>
      <div className="flex-grow">
        <p className="text-sm font-bold">{txn.title}</p>
        <p className="text-xs text-on-surface-variant">
          {txn.categoryName}
          {" • "}
          {formatTimeAgo(txn.date)}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isIncome ? "text-secondary" : "text-on-surface"}`}>
          {amountPrefix}
          {formatCurrency(txn.amount)}
        </p>
        <p className="text-[10px] font-bold uppercase text-outline">
          {isIncome ? "income" : "debit"}
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

interface DashboardViewProps {
  data: DashboardData;
}

export function DashboardView({ data }: DashboardViewProps) {
  const auth = useContext(AuthContext);
  const firstName = auth?.user?.name?.split(" ")[0] ?? "there";
  const greeting = getGreeting();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { balance, monthlySpending, savingsGoal, categoryDistribution, recentTransactions } = data;

  // Savings delta: how much more (or less) was saved vs last month
  const savingsDelta = balance.monthlySavings - balance.lastMonthSavings;

  const statCards = [
    {
      label: "TOTAL BALANCE",
      value: balance.totalBalance,
      icon: "account_balance",
      badge: savingsDelta >= 0 ? `+${formatCurrency(savingsDelta)}` : formatCurrency(savingsDelta),
      badgeColor: savingsDelta >= 0 ? "text-secondary" : "text-error",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "THIS MONTH SPENDING",
      value: monthlySpending.spent,
      icon: "trending_down",
      badge: monthlySpending.limit > 0
        ? `-${Math.round((monthlySpending.spent / monthlySpending.limit) * 100)}%`
        : "—",
      badgeColor: "text-error",
      iconBg: "bg-error/10 text-error",
    },
    {
      label: "REMAINING BUDGET",
      value: monthlySpending.remaining,
      icon: "payments",
      badge: `${monthlySpending.daysLeft} days left`,
      badgeColor: "text-outline",
      iconBg: "bg-secondary/10 text-secondary",
    },
  ];

  return (
    <div className="space-y-xl">
      {/* Hero + Savings Goal */}
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        <div className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary to-tertiary p-lg text-on-primary shadow-lg md:col-span-2 md:min-h-[220px] md:p-xl">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />
          <div className="relative z-10">
            <p className="mb-base text-xs font-semibold uppercase tracking-wider opacity-80">
              {greeting}, {firstName}
            </p>
            <h2 className="mb-sm text-2xl font-bold md:text-3xl">
              {savingsDelta >= 0 ? (
                <>
                  You&apos;ve saved{" "}
                  <span className="rounded-lg bg-secondary-fixed px-2 py-0.5 text-on-secondary-container">
                    {formatCurrency(Math.abs(savingsDelta))}
                  </span>{" "}
                  more than last month. Keep it up!
                </>
              ) : (
                <>
                  Your savings are down{" "}
                  <span className="rounded-lg bg-error/20 px-2 py-0.5 text-white">
                    {formatCurrency(Math.abs(savingsDelta))}
                  </span>{" "}
                  vs last month. Let&apos;s adjust!
                </>
              )}
            </h2>
          </div>
          <div className="relative z-10 mt-lg hidden gap-md md:flex">
            <button
              type="button"
              className="rounded-lg bg-white px-lg py-sm font-bold text-primary shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            >
              View Insights
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/30 bg-primary/20 px-lg py-sm font-bold text-white transition-all hover:bg-primary/30 active:scale-[0.98]"
            >
              Monthly Plan
            </button>
          </div>
        </div>

        {/* Savings Goal card */}
        <div className="card-shadow hidden flex-col justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-xl text-center md:flex">
          <div className="mb-sm text-primary">
            <Icon name="savings" className="!text-4xl" />
          </div>
          <h3 className="mb-xs text-xl font-semibold">Savings Goal</h3>
          {savingsGoal ? (
            <>
              <p className="mb-md text-sm text-on-surface-variant">{savingsGoal.name}</p>
              <div className="mb-xs h-2 w-full rounded-full bg-surface-container-low">
                <div
                  className="h-full rounded-full bg-primary shadow-[0_0_8px_rgba(0,60,144,0.3)]"
                  style={{ width: `${Math.min(savingsGoal.progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-right text-sm font-bold text-primary">
                {savingsGoal.progressPercent.toFixed(0)}% of{" "}
                {formatCurrency(savingsGoal.targetAmount)}
              </p>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">No active savings goal</p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-card-gap md:grid-cols-3 md:gap-lg">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="card-shadow rounded-xl border border-outline-variant bg-surface-container-lowest p-md transition-transform hover:-translate-y-1 md:p-lg"
          >
            <div className="mb-sm flex items-start justify-between">
              <span className={`rounded-lg p-base ${card.iconBg}`}>
                <Icon name={card.icon} />
              </span>
              <span className={`text-xs font-bold ${card.badgeColor}`}>{card.badge}</span>
            </div>
            <p className="text-xs font-semibold tracking-wider text-on-surface-variant">
              {card.label}
            </p>
            <p className="mt-xs text-2xl font-bold">{formatCurrency(card.value)}</p>
            {card.label === "THIS MONTH SPENDING" && monthlySpending.limit > 0 && (
              <div className="mt-sm space-y-1">
                <ProgressBar
                  percent={Math.min(
                    Math.round((monthlySpending.spent / monthlySpending.limit) * 100),
                    100,
                  )}
                  trackClassName="h-1.5 bg-surface-container"
                  fillClassName="bg-primary"
                />
                <p className="text-xs text-on-surface-variant">
                  of {formatCurrency(monthlySpending.limit)} monthly limit
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Distribution + Recent Transactions */}
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-5">
        <section className="card-shadow rounded-xl border border-outline-variant bg-surface-container-lowest p-md lg:col-span-3 lg:p-xl">
          <div className="mb-lg flex items-center justify-between lg:mb-xl">
            <h3 className="text-lg font-bold lg:text-xl">Category Distribution</h3>
            <button
              type="button"
              className="text-xs font-bold text-primary hover:underline lg:text-sm"
            >
              Full Details
            </button>
          </div>
          {categoryDistribution.length > 0 ? (
            <div className="grid grid-cols-2 gap-md text-center sm:grid-cols-4 lg:gap-lg">
              {categoryDistribution.slice(0, 4).map((cat) => (
                <div key={cat.categoryId} className="flex flex-col items-center gap-2">
                  <div className="relative h-20 w-20 lg:h-24 lg:w-24">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-surface-container-low"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        stroke={cat.color ?? "currentColor"}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - cat.percent / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {cat.percent.toFixed(0)}%
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {cat.categoryName}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-on-surface-variant">
              No spending data for this month yet.
            </p>
          )}
        </section>

        <section className="card-shadow rounded-xl border border-outline-variant bg-surface-container-lowest p-md lg:col-span-2 lg:p-xl">
          <div className="mb-lg flex items-center justify-between lg:mb-xl">
            <h3 className="text-lg font-bold lg:text-xl">Recent Transactions</h3>
            <Icon
              name="filter_list"
              className="cursor-pointer text-outline transition-colors hover:text-primary"
            />
          </div>
          <div className="space-y-sm lg:space-y-md">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => (
                <RecentTransactionItem key={txn.id} txn={txn} />
              ))
            ) : (
              <p className="text-center text-sm text-on-surface-variant">No transactions yet.</p>
            )}
          </div>
          <Link
            href={ROUTES.EXPENSES}
            className="mt-lg block w-full rounded-lg border border-outline-variant py-sm text-center text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container lg:mt-xl"
          >
            View All Transactions
          </Link>
        </section>
      </div>

      <button
        type="button"
        aria-label="Add transaction"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-24 right-md z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-container active:scale-95 lg:bottom-lg lg:right-lg"
      >
        <Icon name="add" className="!text-3xl" />
      </button>

      <AddTransactionDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}

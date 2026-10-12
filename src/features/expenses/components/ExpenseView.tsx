"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { AddTransactionDialog } from "@/features/transactions/components/AddTransactionDialog";
import { DeleteConfirmDialog } from "@/features/expenses/components/DeleteConfirmDialog";
import type { TransactionResponse, TransactionType } from "@/features/transactions/types";
import type { Category } from "@/features/categories/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

type FilterType = "all" | "expense" | "income";
type SortField = "date" | "amount" | "title";
type SortDir = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Exports a list of transactions to a .csv file and triggers browser download */
function downloadCsv(rows: TransactionResponse[], label: string) {
  const headers = ["Date", "Title", "Description", "Type", "Category", "Amount"];
  const csvRows = [
    headers.join(","),
    ...rows.map((t) =>
      [
        new Date(t.date).toLocaleDateString("en-US"),
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(t.description ?? "").replace(/"/g, '""')}"`,
        t.type === 1 ? "Expense" : "Income",
        `"${(t.categoryName ?? "").replace(/"/g, '""')}"`,
        t.type === 1 ? -t.amount : t.amount,
      ].join(","),
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

function StatCard({ label, value, icon, colorClass, bgClass }: StatCardProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {label}
          </p>
          <p className={`mt-xs text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-sm ${bgClass}`}>
          <Icon name={icon} className={colorClass} />
        </div>
      </div>
    </div>
  );
}

// ─── Type filter tabs ─────────────────────────────────────────────────────────

interface TypeTabsProps {
  active: FilterType;
  onChange: (f: FilterType) => void;
}

function TypeTabs({ active, onChange }: TypeTabsProps) {
  const tabs: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "expense", label: "Expenses" },
    { id: "income", label: "Income" },
  ];

  return (
    <div className="flex gap-xs rounded-xl border border-outline-variant p-xs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-md py-xs text-sm font-semibold transition-all ${
            active === tab.id
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Month / Year selectors ───────────────────────────────────────────────────

interface PeriodSelectorProps {
  month: number | null;   // 0-indexed (0=Jan … 11=Dec), null = all months
  year: number;
  onMonthChange: (m: number | null) => void;
  onYearChange: (y: number) => void;
}

function PeriodSelector({ month, year, onMonthChange, onYearChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-xs">
      <select
        value={month ?? "all"}
        onChange={(e) => onMonthChange(e.target.value === "all" ? null : Number(e.target.value))}
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="all">All months</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={i} value={i}>{name}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {YEAR_OPTIONS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Category pills ───────────────────────────────────────────────────────────

interface CategoryPillsProps {
  categories: Category[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

function CategoryPills({ categories, selectedId, onChange }: CategoryPillsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-xs">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full border px-md py-xs text-xs font-semibold transition-all ${
          selectedId === null
            ? "border-primary bg-primary text-on-primary"
            : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(selectedId === cat.id ? null : cat.id)}
          className={`rounded-full border px-md py-xs text-xs font-semibold transition-all ${
            selectedId === cat.id
              ? "border-primary bg-primary text-on-primary"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
        </button>
      ))}
    </div>
  );
}

// ─── Sort button ──────────────────────────────────────────────────────────────

interface SortButtonProps {
  field: SortField;
  label: string;
  current: SortField;
  dir: SortDir;
  onClick: (f: SortField) => void;
}

function SortButton({ field, label, current, dir, onClick }: SortButtonProps) {
  const active = current === field;
  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
    >
      {label}
      {active && (
        <Icon
          name={dir === "asc" ? "arrow_upward" : "arrow_downward"}
          className="text-primary"
        />
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ExpenseViewProps {
  initialTransactions: TransactionResponse[];
  categories: Category[];
}

export function ExpenseView({ initialTransactions, categories }: ExpenseViewProps) {
  // ── Data state ──
  const [transactions, setTransactions] = useState<TransactionResponse[]>(initialTransactions);

  // ── Filter / sort / search state ──
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // ── Dialog state ──
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransactionResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionResponse | null>(null);

  // ── Filtered rows (drives stats, table, and CSV export) ──
  const filtered = useMemo(() => {
    let rows = transactions;

    // Month / year filter
    rows = rows.filter((t) => {
      const d = new Date(t.date);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      return yearMatch && monthMatch;
    });

    // Type filter
    if (filterType === "expense") rows = rows.filter((t) => t.type === 1);
    else if (filterType === "income") rows = rows.filter((t) => t.type === 0);

    // Category filter
    if (selectedCategoryId) {
      rows = rows.filter((t) => t.categoryId === selectedCategoryId);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.categoryName?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      );
    }

    // Sort
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [transactions, filterType, selectedCategoryId, selectedMonth, selectedYear, search, sortField, sortDir]);

  // ── Stats computed from filtered rows ──
  const stats = useMemo(() => {
    const totalExpense = filtered.filter((t) => t.type === 1).reduce((s, t) => s + t.amount, 0);
    const totalIncome = filtered.filter((t) => t.type === 0).reduce((s, t) => s + t.amount, 0);
    return { totalExpense, totalIncome, net: totalIncome - totalExpense };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Handlers ──
  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  function resetPage() { setPage(1); }

  function handleAddSuccess(txn: TransactionResponse) {
    setTransactions((prev) => [txn, ...prev]);
  }

  function handleEditSuccess(txn: TransactionResponse) {
    setTransactions((prev) => prev.map((t) => (t.id === txn.id ? txn : t)));
    setEditTarget(null);
  }

  function handleDeleteSuccess(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setDeleteTarget(null);
  }

  function handleDownloadCsv() {
    const periodLabel =
      selectedMonth !== null
        ? `${MONTH_NAMES[selectedMonth].toLowerCase()}-${selectedYear}`
        : `${selectedYear}`;
    downloadCsv(filtered, periodLabel);
  }

  // Human-readable period label for header subtitle
  const periodLabel =
    selectedMonth !== null
      ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
      : `All of ${selectedYear}`;

  return (
    <div className="space-y-lg">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-md">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Expenses</h1>
          <p className="text-sm text-on-surface-variant">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} · {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCsv}
            title="Download filtered transactions as CSV"
            className="flex items-center gap-xs rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-sm text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <Icon name="file_download" className="text-on-surface-variant" />
            Export CSV
          </button>

          {/* New Expense */}
          <Button
            variant="primary"
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-xs"
          >
            <Icon name="add" className="text-on-primary" />
            New Expense
          </Button>
        </div>
      </div>

      {/* ── Stats cards — reflect current period filter ── */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        <StatCard
          label="Total Expenses"
          value={formatCurrency(stats.totalExpense)}
          icon="trending_down"
          colorClass="text-error"
          bgClass="bg-error/10"
        />
        <StatCard
          label="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon="trending_up"
          colorClass="text-secondary"
          bgClass="bg-secondary/10"
        />
        <StatCard
          label="Net Balance"
          value={formatCurrency(stats.net)}
          icon="account_balance"
          colorClass={stats.net >= 0 ? "text-secondary" : "text-error"}
          bgClass={stats.net >= 0 ? "bg-secondary/10" : "bg-error/10"}
        />
      </div>

      {/* ── Filter bar: Type tabs + Period selectors + Search ── */}
      <div className="flex flex-wrap items-center gap-md">
        <TypeTabs
          active={filterType}
          onChange={(f) => { setFilterType(f); resetPage(); }}
        />

        <PeriodSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={(m) => { setSelectedMonth(m); resetPage(); }}
          onYearChange={(y) => { setSelectedYear(y); resetPage(); }}
        />

        {/* Search */}
        <div className="flex flex-1 items-center gap-xs rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-sm min-w-48">
          <Icon name="search" className="text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <Icon name="close" className="text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills ── */}
      <CategoryPills
        categories={categories}
        selectedId={selectedCategoryId}
        onChange={(id) => { setSelectedCategoryId(id); resetPage(); }}
      />

      {/* ── Table ── */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_5rem] gap-md border-b border-outline-variant px-lg py-sm">
          <SortButton field="title" label="Title" current={sortField} dir={sortDir} onClick={handleSort} />
          <SortButton field="amount" label="Amount" current={sortField} dir={sortDir} onClick={handleSort} />
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Category</span>
          <SortButton field="date" label="Date" current={sortField} dir={sortDir} onClick={handleSort} />
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Actions</span>
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-sm py-2xl text-on-surface-variant">
            <Icon name="receipt_long" className="opacity-40 text-5xl" />
            <p className="text-sm">No transactions for {periodLabel}.</p>
          </div>
        ) : (
          paginated.map((txn) => (
            <div
              key={txn.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_5rem] items-center gap-md border-b border-outline-variant/50 px-lg py-md last:border-b-0 hover:bg-surface-container/40 transition-colors"
            >
              {/* Title */}
              <div className="flex items-center gap-sm overflow-hidden">
                <div className={`shrink-0 rounded-full p-xs ${txn.type === 1 ? "bg-error/10" : "bg-secondary/10"}`}>
                  <Icon
                    name={txn.type === 1 ? "arrow_outward" : "arrow_downward"}
                    className={txn.type === 1 ? "text-error" : "text-secondary"}
                  />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-semibold text-on-surface">{txn.title}</p>
                  {txn.description && (
                    <p className="truncate text-xs text-on-surface-variant">{txn.description}</p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <span className={`text-sm font-bold ${txn.type === 1 ? "text-error" : "text-secondary"}`}>
                {txn.type === 1 ? "−" : "+"}{formatCurrency(txn.amount)}
              </span>

              {/* Category */}
              <span className="rounded-full bg-surface-container px-sm py-xs text-xs font-medium text-on-surface-variant truncate">
                {txn.categoryName ?? "—"}
              </span>

              {/* Date */}
              <span className="text-xs text-on-surface-variant">{formatDate(txn.date)}</span>

              {/* Actions */}
              <div className="flex items-center gap-xs">
                <button
                  type="button"
                  aria-label={`Edit ${txn.title}`}
                  onClick={() => setEditTarget(txn)}
                  className="rounded-lg p-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                >
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${txn.title}`}
                  onClick={() => setDeleteTarget(txn)}
                  className="rounded-lg p-xs text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                >
                  <Icon name="delete" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-outline-variant p-xs text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="chevron_left" />
            </button>
            <span className="px-sm text-sm text-on-surface">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-outline-variant p-xs text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      )}

      {/* ── Spending insight placeholder ── */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <div className="mb-md flex items-center gap-sm">
          <Icon name="insights" className="text-primary" />
          <h2 className="text-base font-semibold text-on-surface">Spending Insights</h2>
          <span className="ml-auto rounded-full bg-primary-container px-sm py-xs text-xs font-semibold text-on-primary-container">
            Coming soon
          </span>
        </div>
        <p className="text-sm text-on-surface-variant">
          Spending breakdowns, trends, and category comparisons will appear here once enough data is collected.
        </p>
        <div className="mt-md flex items-center gap-sm rounded-xl bg-surface-container p-md">
          <Icon name="bar_chart" className="text-outline text-5xl" />
          <div>
            <p className="text-sm font-semibold text-on-surface">Charts &amp; analytics</p>
            <p className="text-xs text-on-surface-variant">
              Visual breakdown of your income vs expenses over time.
            </p>
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <AddTransactionDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <AddTransactionDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
        initialValues={editTarget ?? undefined}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        transactionId={deleteTarget?.id ?? null}
        transactionTitle={deleteTarget?.title}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

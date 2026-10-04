"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { ApiError } from "@/lib/apiError";
import type { Category } from "@/features/categories/types";
import type {
  CreateTransactionPayload,
  TransactionResponse,
  TransactionType,
} from "@/features/transactions/types";

// ─── Type toggle ─────────────────────────────────────────────────────────────

interface TypeToggleProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div>
      <p className="mb-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        Transaction Type
      </p>
      <div className="grid grid-cols-2 gap-sm rounded-xl border border-outline-variant p-xs">
        <button
          type="button"
          onClick={() => onChange(1)}
          className={`flex items-center justify-center gap-xs rounded-lg px-md py-sm text-sm font-bold transition-all ${
            value === 1
              ? "bg-error/10 text-error ring-1 ring-error/30"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="text-base">↗</span> Expense
        </button>
        <button
          type="button"
          onClick={() => onChange(0)}
          className={`flex items-center justify-center gap-xs rounded-lg px-md py-sm text-sm font-bold transition-all ${
            value === 0
              ? "bg-secondary/10 text-secondary ring-1 ring-secondary/30"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="text-base">↓</span> Income
        </button>
      </div>
    </div>
  );
}

// ─── Amount input ─────────────────────────────────────────────────────────────

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div>
      <p className="mb-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        Amount
      </p>
      <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-container">
        <span className="border-r border-outline-variant px-md py-sm text-sm font-bold text-on-surface-variant">
          $
        </span>
        <input
          id="txn-amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-md py-sm text-sm text-on-surface focus:outline-none"
        />
      </div>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save so the parent can refresh its data. */
  onSuccess?: (txn: TransactionResponse) => void;
}

export function AddTransactionDialog({
  open,
  onClose,
  onSuccess,
}: AddTransactionDialogProps) {
  // Form state
  const [type, setType] = useState<TransactionType>(1); // default: Expense
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [description, setDescription] = useState("");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories when dialog opens
  useEffect(() => {
    if (!open) return;

    setLoadingCategories(true);
    apiClient
      .get<Category[]>(API_ROUTES.category.base)
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Failed to load categories";
        toast.error(msg);
      })
      .finally(() => setLoadingCategories(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function resetForm() {
    setType(1);
    setAmount("");
    setTitle("");
    setCategoryId(categories[0]?.id ?? "");
    setDate(todayIso());
    setDescription("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    const payload: CreateTransactionPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      amount: parseFloat(amount),
      type,
      date: new Date(date).toISOString(),
      categoryId,
    };

    setIsSubmitting(true);
    try {
      const txn = await apiClient.post<TransactionResponse>(
        API_ROUTES.transaction.base,
        payload,
      );
      toast.success("Transaction saved!");
      onSuccess?.(txn);
      handleClose();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.icon ? `${cat.icon} ${cat.name}` : cat.name,
  }));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add New Transaction"
      description="Record an expense or credit to your ledger."
    >
      <form className="space-y-md" onSubmit={handleSubmit}>
        {/* Type toggle */}
        <TypeToggle value={type} onChange={setType} />

        {/* Amount */}
        <AmountInput value={amount} onChange={setAmount} />

        {/* Title */}
        <FormInput
          id="txn-title"
          label="Title"
          placeholder="e.g. Trader Joe's Groceries"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Category + Date — side by side */}
        <div className="grid grid-cols-2 gap-md">
          <div>
            {loadingCategories ? (
              <div className="flex items-center gap-sm">
                <Spinner size="sm" />
                <span className="text-xs text-on-surface-variant">Loading categories…</span>
              </div>
            ) : (
              <FormSelect
                id="txn-category"
                label="Category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categoryOptions}
                required
              />
            )}
          </div>
          <FormInput
            id="txn-date"
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-xs">
          <label
            htmlFor="txn-description"
            className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            Description (optional)
          </label>
          <textarea
            id="txn-description"
            rows={2}
            placeholder="Add any notes about this transaction…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-sm pt-sm">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Transaction
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

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

// ─── Type toggle ──────────────────────────────────────────────────────────────

interface TypeToggleProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
  disabled?: boolean;
}

function TypeToggle({ value, onChange, disabled }: TypeToggleProps) {
  return (
    <div>
      <p className="mb-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        Transaction Type {disabled && <span className="normal-case font-normal text-outline">(cannot be changed)</span>}
      </p>
      <div className={`grid grid-cols-2 gap-sm rounded-xl border border-outline-variant p-xs ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
        <button
          type="button"
          onClick={() => !disabled && onChange(1)}
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
          onClick={() => !disabled && onChange(0)}
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
  /**
   * When provided the dialog switches to EDIT mode:
   * - Form is pre-filled from this transaction
   * - Title shows "Edit Transaction"
   * - Submit calls PUT instead of POST
   * - TypeToggle is disabled (type cannot change after creation)
   */
  initialValues?: TransactionResponse;
}

export function AddTransactionDialog({
  open,
  onClose,
  onSuccess,
  initialValues,
}: AddTransactionDialogProps) {
  const isEditMode = !!initialValues;

  // Form state — seeded from initialValues when in edit mode
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? 1);
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : "");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [date, setDate] = useState(
    initialValues ? toDateInputValue(initialValues.date) : todayIso(),
  );
  const [description, setDescription] = useState(initialValues?.description ?? "");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-seed form whenever initialValues changes (switching between different rows to edit)
  useEffect(() => {
    if (initialValues) {
      setType(initialValues.type);
      setAmount(String(initialValues.amount));
      setTitle(initialValues.title);
      setCategoryId(initialValues.categoryId);
      setDate(toDateInputValue(initialValues.date));
      setDescription(initialValues.description ?? "");
    } else {
      setType(1);
      setAmount("");
      setTitle("");
      setDate(todayIso());
      setDescription("");
    }
  }, [initialValues]);

  // Load categories when dialog opens
  useEffect(() => {
    if (!open) return;

    setLoadingCategories(true);
    apiClient
      .get<Category[]>(API_ROUTES.category.base)
      .then((cats) => {
        setCategories(cats);
        // In add mode only, auto-select first category if none selected
        if (cats.length > 0 && !categoryId && !isEditMode) {
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
    if (!isEditMode) resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      let txn: TransactionResponse;

      if (isEditMode && initialValues) {
        // Edit mode — PUT with UpdateTransactionDto shape (no type field)
        const payload = {
          title: title.trim(),
          description: description.trim() || undefined,
          amount: parseFloat(amount),
          date: new Date(date).toISOString(),
          categoryId,
        };
        txn = await apiClient.put<TransactionResponse>(
          API_ROUTES.transaction.byId(initialValues.id),
          payload,
        );
        toast.success("Transaction updated!");
      } else {
        // Add mode — POST with CreateTransactionDto shape (includes type)
        const payload: CreateTransactionPayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          amount: parseFloat(amount),
          type,
          date: new Date(date).toISOString(),
          categoryId,
        };
        txn = await apiClient.post<TransactionResponse>(
          API_ROUTES.transaction.base,
          payload,
        );
        toast.success("Transaction saved!");
      }

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
      title={isEditMode ? "Edit Transaction" : "Add New Transaction"}
      description={
        isEditMode
          ? "Update the details of this transaction."
          : "Record an expense or credit to your ledger."
      }
    >
      <form className="space-y-md" onSubmit={handleSubmit}>
        {/* Type toggle — disabled in edit mode */}
        <TypeToggle value={type} onChange={setType} disabled={isEditMode} />

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
            {isEditMode ? "Update Transaction" : "Save Transaction"}
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

/** Converts a backend ISO datetime string to a yyyy-MM-dd date input value */
function toDateInputValue(iso: string): string {
  return iso.split("T")[0];
}

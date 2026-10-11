"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import { ApiError } from "@/lib/apiError";

interface DeleteConfirmDialogProps {
  open: boolean;
  /** The transaction to delete. Pass `null` to close without action. */
  transactionId: string | null;
  transactionTitle?: string;
  onClose: () => void;
  /** Called after a successful deletion so the parent can remove the row. */
  onSuccess: (deletedId: string) => void;
}

export function DeleteConfirmDialog({
  open,
  transactionId,
  transactionTitle,
  onClose,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!transactionId) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(API_ROUTES.transaction.byId(transactionId));
      toast.success("Transaction deleted.");
      onSuccess(transactionId);
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete transaction.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Delete Transaction">
      <div className="space-y-md">
        {/* Warning icon + body text */}
        <div className="flex items-start gap-md rounded-xl bg-error/10 px-md py-md">
          <Icon name="warning" className="text-error mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-error">This action cannot be undone.</p>
            <p className="mt-xs text-sm text-on-surface-variant">
              You are about to permanently delete{" "}
              <span className="font-medium text-on-surface">
                {transactionTitle ? `"${transactionTitle}"` : "this transaction"}
              </span>
              . Are you sure?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-sm pt-xs">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isDeleting}
            onClick={handleDelete}
            className="bg-error text-on-error hover:bg-error/90"
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

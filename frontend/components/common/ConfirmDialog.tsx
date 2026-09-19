"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex rounded-full p-2 ${
            destructive
              ? "bg-rose-50 text-rose-600"
              : "bg-primary-50 text-primary-600"
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-600">
          {description ?? "This action cannot be undone."}
        </p>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy || loading}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
            destructive
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-primary-600 hover:bg-primary-700"
          }`}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
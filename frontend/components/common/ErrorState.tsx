"use client";

import { AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export default function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 card-shadow">
        <AlertCircle className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-rose-700">
          Something went wrong
        </p>
        <p className="mt-1 max-w-sm text-sm text-rose-600/80">
          {getErrorMessage(error)}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}
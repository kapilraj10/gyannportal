import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PaginationMeta } from "@/types/api";

export default function Pagination({
  meta,
  onChange,
}: {
  meta: PaginationMeta;
  onChange: (page: number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  const pages: number[] = [];
  const total = meta.totalPages;
  const current = meta.page;

  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-deep-500">
        Showing{" "}
        <span className="font-medium text-deep-700">
          {meta.total === 0 ? 0 : (current - 1) * meta.limit + 1}–
          {Math.min(current * meta.limit, meta.total)}
        </span>{" "}
        of <span className="font-medium text-deep-700">{meta.total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
          className="rounded-lg p-1.5 text-deep-500 ring-1 ring-deep-200 transition hover:bg-deep-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange(1)}
              className="rounded-lg px-3 py-1.5 text-sm text-deep-500 transition hover:bg-deep-50"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-deep-400">…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              page === current
                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-[0_6px_16px_-8px_rgba(37,99,235,0.6)]"
                : "text-deep-600 hover:bg-deep-100"
            }`}
          >
            {page}
          </button>
        ))}

        {end < total && (
          <>
            {end < total - 1 && <span className="px-1 text-deep-400">…</span>}
            <button
              type="button"
              onClick={() => onChange(total)}
              className="rounded-lg px-3 py-1.5 text-sm text-deep-500 transition hover:bg-deep-50"
            >
              {total}
            </button>
          </>
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={current >= total}
          onClick={() => onChange(current + 1)}
          className="rounded-lg p-1.5 text-deep-500 ring-1 ring-deep-200 transition hover:bg-deep-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
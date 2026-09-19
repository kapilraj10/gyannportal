import type { ColumnDef } from "@/types/table";

import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import Pagination from "./Pagination";
import type { PaginationMeta } from "@/types/api";

export type { ColumnDef };

/**
 * Lightweight styled table with loading, empty, and pagination states.
 */
export default function DataTable<T>({
  columns,
  rows,
  loading = false,
  emptyTitle,
  emptyDescription,
  meta,
  onPageChange,
  rowKey,
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  meta?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  rowKey: (row: T) => string;
}) {
  if (loading) return <LoadingState />;

  if (!rows.length) {
    return (
      <>
        <EmptyState title={emptyTitle} description={emptyDescription} />
        {meta && onPageChange && <Pagination meta={meta} onChange={onPageChange} />}
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-deep-100 bg-white card-shadow">
        <table className="min-w-full divide-y divide-deep-100 text-sm">
          <thead className="bg-deep-50/80">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key ?? index}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-deep-500 ${column.headerClassName ?? ""} ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-deep-100">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="transition-colors hover:bg-primary-50/40"
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key ?? index}
                    className={`px-4 py-3 text-deep-700 ${column.cellClassName ?? ""} ${
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                          ? "text-center"
                          : ""
                    }`}
                  >
                    {column.render
                      ? column.render(row)
                      : (() => {
                          const value = row[column.key as keyof T] as unknown;
                          if (value === null || value === undefined) return null;
                          if (typeof value === "object") {
                            const candidate = (value as { name?: unknown })?.name;
                            return typeof candidate === "string"
                              ? candidate
                              : JSON.stringify(value);
                          }
                          return value as React.ReactNode;
                        })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && onPageChange && <Pagination meta={meta} onChange={onPageChange} />}
    </>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";

import { studentsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

import type { Result } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

function gradeColor(grade?: string | null): string {
  if (!grade) return "bg-slate-100 text-slate-600";
  const normalized = grade.trim().toUpperCase();
  if (["A+", "A", "A-"].includes(normalized)) return "bg-emerald-50 text-emerald-700";
  if (normalized.startsWith("B")) return "bg-blue-50 text-blue-700";
  if (normalized.startsWith("C")) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

export default function StudentMarksPage() {
  const [rows, setRows] = useState<Result[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentsApi.getMyResults({ page, limit: 20 });
      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnDef<Result>[] = [
    {
      key: "exam",
      header: "Exam",
      render: (row) => <span className="text-slate-600">{row.exam?.name ?? "—"}</span>,
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => <span className="text-slate-600">{row.subject?.name ?? "—"}</span>,
    },
    {
      key: "marks",
      header: "Marks",
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.marksObtained}
          <span className="font-normal text-slate-400"> / {row.maxMarks}</span>
        </span>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${gradeColor(row.grade)}`}
        >
          {row.grade ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Published",
      render: (row) => (
        <span className="text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <DashboardShell role="STUDENT">
      <PageHeader
        title="My Marks"
        description="Grades published for your exams."
      />

      {error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="No marks published yet" />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          meta={meta}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </DashboardShell>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import { FileBarChart } from "lucide-react";

import { examsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

import type { Exam } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import Badge from "@/components/common/Badge";

export default function TeacherExamsPage() {
  const [rows, setRows] = useState<Exam[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await examsApi.list({ page, limit: 20 });
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

  const columns: ColumnDef<Exam>[] = [
    {
      key: "name",
      header: "Exam",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FileBarChart className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.examType ?? ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (row) => (
        <span className="text-slate-600">{row.class?.name ?? "School-wide"}</span>
      ),
    },
    {
      key: "startDate",
      header: "Start",
      render: (row) => (
        <span className="text-slate-500">{formatDate(row.startDate)}</span>
      ),
    },
    {
      key: "endDate",
      header: "End",
      render: (row) => (
        <span className="text-slate-500">{formatDate(row.endDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
  ];

  return (
    <DashboardShell role="TEACHER">
      <PageHeader
        title="Exams"
        description="Examinations scheduled in your school."
      />

      {error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="No exams scheduled" />
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
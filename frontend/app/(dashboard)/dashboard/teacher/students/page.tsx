"use client";

import { useCallback, useEffect, useState } from "react";

import { teachersApi } from "@/lib/api";

import type { Student } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

export default function TeacherStudentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await teachersApi.getMyStudents({ page, limit: 20 });
      setRows(result.data as unknown as Student[]);
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

  const columns: ColumnDef<Student>[] = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.user?.name ?? "—"}</p>
          <p className="text-xs text-slate-400">{row.studentCode}</p>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (row) => (
        <span className="text-slate-600">
          {row.class?.name ?? "—"}
          {row.section?.name ? ` · ${row.section.name}` : ""}
        </span>
      ),
    },
    {
      key: "guardian",
      header: "Guardian",
      render: (row) => (
        <span className="text-slate-600">{row.guardianName ?? "—"}</span>
      ),
    },
    {
      key: "studentCode",
      header: "Code",
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.studentCode}</span>
      ),
    },
  ];

  return (
    <DashboardShell role="TEACHER">
      <PageHeader
        title="My Students"
        description="Students enrolled in your classes."
      />

      {error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="No students found" />
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
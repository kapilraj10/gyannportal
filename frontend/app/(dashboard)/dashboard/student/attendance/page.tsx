"use client";

import { useCallback, useEffect, useState } from "react";

import { studentsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

import type { Attendance } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import Badge from "@/components/common/Badge";

export default function StudentAttendancePage() {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentsApi.getMyAttendance({ page, limit: 20 });
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

  const columns: ColumnDef<Attendance>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="text-slate-700">{formatDate(row.date)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (row) => (
        <span className="text-slate-500">{row.remarks ?? "—"}</span>
      ),
    },
  ];

  return (
    <DashboardShell role="STUDENT">
      <PageHeader
        title="My Attendance"
        description="Your attendance records."
      />

      {error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="No attendance recorded yet" />
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
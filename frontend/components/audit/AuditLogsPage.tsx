"use client";

import { useCallback, useEffect, useState } from "react";

import { auditLogsApi, superAdminApi } from "@/lib/api";
import { formatDateTime, initials, titleCase } from "@/lib/format";

import type { AuditLog } from "@/types/domain";
import type { ListResult, PaginationMeta, PaginationParams } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import type { UserRole } from "@/lib/roles";

const ENTITY_COLORS: Record<string, string> = {
  School: "bg-primary-50 text-primary-700",
  User: "bg-violet-50 text-violet-700",
  Student: "bg-emerald-50 text-emerald-700",
  Teacher: "bg-teal-50 text-teal-700",
  Parent: "bg-amber-50 text-amber-700",
  Class: "bg-indigo-50 text-indigo-700",
  Section: "bg-indigo-50 text-indigo-700",
  Subject: "bg-cyan-50 text-cyan-700",
  Course: "bg-sky-50 text-sky-700",
  Exam: "bg-rose-50 text-rose-700",
  Result: "bg-green-50 text-green-700",
  Assignment: "bg-blue-50 text-blue-700",
  Attendance: "bg-orange-50 text-orange-700",
  RefreshToken: "bg-slate-100 text-slate-600",
};

export default function AuditLogsPage(
  { role, scope }: { role: UserRole; scope: "platform" | "school" },
) {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const list = useCallback(
    async (params: PaginationParams): Promise<ListResult<AuditLog>> =>
      scope === "platform"
        ? superAdminApi.listAuditLogs(params)
        : auditLogsApi.list(params),
    [scope],
  );

  const load = useCallback(
    async (nextPage = page) => {
      setLoading(true);
      setError(null);

      try {
        const result = await list({ page: nextPage, limit: 15 });
        setRows(result.data);
        setMeta(result.meta);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [list, page],
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns: ColumnDef<AuditLog>[] = [
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-700">
          {row.action}
        </span>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ENTITY_COLORS[row.entity] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {titleCase(row.entity)}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span className="line-clamp-1 max-w-md text-slate-500">
          {row.description ?? "—"}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
            {initials(row.user?.name)}
          </span>
          <span className="text-slate-700">{row.user?.name ?? "System"}</span>
        </div>
      ),
    },
    {
      key: "ip",
      header: "IP",
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {row.ipAddress ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Timestamp",
      render: (row) => (
        <span className="text-slate-500">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <DashboardShell role={role}>
      <PageHeader
        title="Audit Logs"
        description={
          scope === "platform"
            ? "Platform-wide activity across all schools."
            : "Activity within your school."
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          meta={meta}
          onPageChange={setPage}
          loading={loading}
          emptyTitle="No activity yet"
        />
      )}
    </DashboardShell>
  );
}
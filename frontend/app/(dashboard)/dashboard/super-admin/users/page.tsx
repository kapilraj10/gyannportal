"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, CheckCircle, XCircle } from "lucide-react";

import { superAdminApi } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";

import type { User } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import Badge from "@/components/common/Badge";
import { Button, Input, Select } from "@/components/ui";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { page: String(page), limit: "20" };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const result = await superAdminApi.listUsers(params);
      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusChange(user: User, status: string) {
    setPending(user.id);
    setError(null);
    try {
      await superAdminApi.updateUserStatus(user.id, status as User["status"]);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setPending(null);
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            {initials(row.name)}
          </span>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <span className="text-slate-600">
          {row.roleName ??
            (typeof row.role === "string"
              ? row.role
              : (row.role as { name?: string } | null)?.name) ??
            "—"}
        </span>
      ),
    },
    {
      key: "school",
      header: "School",
      render: (row) => (
        <div className="text-slate-600">
          <p>{row.school?.name ?? "—"}</p>
          {row.school && (
            <p className="text-xs text-slate-400">
              {row.school.code}
              {row.branch ? ` · ${row.branch.name}` : ""}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => (
        <span className="text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => {
        if (row.status === "SUSPENDED") {
          return (
            <Button
              variant="secondary"
              size="sm"
              loading={pending === row.id}
              onClick={() => void handleStatusChange(row, "ACTIVE")}
            >
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Activate
            </Button>
          );
        }
        if (row.status === "ACTIVE") {
          return (
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={pending === row.id}
                onClick={() => void handleStatusChange(row, "SUSPENDED")}
              >
                <Ban className="h-4 w-4 text-amber-500" />
                Suspend
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={pending === row.id}
                onClick={() => void handleStatusChange(row, "INACTIVE")}
              >
                <XCircle className="h-4 w-4 text-slate-400" />
                Deactivate
              </Button>
            </div>
          );
        }
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleStatusChange(row, "ACTIVE")}
          >
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Reactivate
          </Button>
        );
      },
    },
  ];

  return (
    <DashboardShell role="SUPER_ADMIN">
      <PageHeader
        title="Users"
        description="All accounts across the platform."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput.trim());
              }}
              className="w-56"
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
              <option value="STUDENT">Student</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>
        }
      />

      {error ? (
        <ErrorState error={getErrorMessage(error)} onRetry={() => void load()} />
      ) : null}

      {!error && (
        <>
          {users.length === 0 && !loading ? (
            <EmptyState
              title="No users found"
              description="Try adjusting your filters."
            />
          ) : (
            <DataTable
              columns={columns}
              rows={users}
              rowKey={(row) => row.id}
              meta={meta}
              onPageChange={setPage}
              loading={loading}
            />
          )}
        </>
      )}
    </DashboardShell>
  );
}
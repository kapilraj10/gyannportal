"use client";

import { UsersRound } from "lucide-react";

import { teachersApi } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

import type { Teacher } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SchoolAdminTeachersPage() {
  return (
    <CrudPage<Teacher>
      title="Teachers"
      description="Staff accounts and their details."
      role="SCHOOL_ADMIN"
      resource={{
        list: teachersApi.list,
        create: resourceMutator(teachersApi.create),
        update: resourceUpdater(teachersApi.update),
        remove: teachersApi.remove,
      }}
      columns={[
        {
          key: "user",
          header: "Teacher",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <UsersRound className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  {row.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-400">{row.employeeCode}</p>
              </div>
            </div>
          ),
        },
        {
          key: "specialization",
          header: "Specialization",
          render: (row) => (
            <span className="text-slate-600">
              {row.specialization ?? "—"}
            </span>
          ),
        },
        {
          key: "qualification",
          header: "Qualification",
          render: (row) => (
            <span className="text-slate-600">{row.qualification ?? "—"}</span>
          ),
        },
        {
          key: "joiningDate",
          header: "Joined",
          render: (row) => (
            <span className="text-slate-500">
              {row.joiningDate ? formatDate(row.joiningDate) : "—"}
            </span>
          ),
        },
        {
          key: "courses",
          header: "Courses",
          render: (row) => (
            <span className="text-slate-600">{row._count?.courses ?? 0}</span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        { name: "name", label: "Full name", required: true, full: true },
        { name: "email", label: "Email", type: "email", full: true },
        { name: "employeeCode", label: "Employee code", required: true },
        { name: "phone", label: "Phone" },
        { name: "specialization", label: "Specialization" },
        { name: "qualification", label: "Qualification" },
        { name: "joiningDate", label: "Joining date", type: "date" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: statusOptions,
        },
      ]}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Teacher"
      editTitle="Edit Teacher"
    />
  );
}
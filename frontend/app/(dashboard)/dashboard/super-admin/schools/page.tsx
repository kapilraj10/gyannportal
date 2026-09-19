"use client";

import { School } from "lucide-react";

import { superAdminApi } from "@/lib/api";
import {
  SCHOOL_LEVEL_OPTIONS,
  SCHOOL_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

import type { School as SchoolType } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SuperAdminSchoolsPage() {
  return (
    <CrudPage<SchoolType>
      title="Schools"
      description="All schools on the platform."
      role="SUPER_ADMIN"
      resource={{
        list: superAdminApi.listSchools,
        create: resourceMutator(superAdminApi.createSchool),
        update: resourceUpdater(superAdminApi.updateSchool),
        remove: superAdminApi.deleteSchool,
      }}
      columns={[
        {
          key: "name",
          header: "School",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <School className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-400">{row.code}</p>
              </div>
            </div>
          ),
        },
        {
          key: "email",
          header: "Contact",
          render: (row) => (
            <div className="text-slate-600">
              <p>{row.email ?? "—"}</p>
              <p className="text-xs text-slate-400">{row.phone ?? ""}</p>
            </div>
          ),
        },
        {
          key: "schoolType",
          header: "Type / Level",
          render: (row) => (
            <span className="text-slate-600">
              {row.schoolType ?? "—"}
              {row.level ? ` · ${row.level}` : ""}
            </span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
        {
          key: "createdAt",
          header: "Established",
          render: (row) => (
            <span className="text-slate-500">
              {row.establishedYear ?? formatDate(row.createdAt)}
            </span>
          ),
        },
      ]}
      fields={[
        { name: "name", label: "School name", required: true, full: true },
        {
          name: "code",
          label: "School code",
          required: true,
          hint: "Letters, numbers, hyphens and underscores only.",
        },
        { name: "registrationNumber", label: "Registration number" },
        {
          name: "schoolType",
          label: "School type",
          type: "select",
          options: SCHOOL_TYPE_OPTIONS,
        },
        {
          name: "level",
          label: "Level",
          type: "select",
          options: SCHOOL_LEVEL_OPTIONS,
        },
        { name: "establishedYear", label: "Established year", type: "number", step: "1" },
        { name: "email", label: "Email", type: "email", full: true },
        { name: "phone", label: "Phone" },
        { name: "website", label: "Website" },
        { name: "address", label: "Address", full: true },
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
      createTitle="Add School"
      editTitle="Edit School"
      emptyTitle="No schools registered yet"
      emptyDescription="Schools appear here after registration."
    />
  );
}
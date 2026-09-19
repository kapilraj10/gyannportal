"use client";

import { CalendarDays } from "lucide-react";

import { academicYearsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

import type { AcademicYear } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

export default function SchoolAdminAcademicYearsPage() {
  return (
    <CrudPage<AcademicYear>
      title="Academic Years"
      description="e.g. 2025–2026. One can be marked as current."
      role="SCHOOL_ADMIN"
      resource={{
        list: academicYearsApi.list,
        create: resourceMutator(academicYearsApi.create),
        update: resourceUpdater(academicYearsApi.update),
        remove: academicYearsApi.remove,
      }}
      columns={[
        {
          key: "name",
          header: "Year",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <CalendarDays className="h-4 w-4" />
              </span>
              <p className="font-medium text-slate-900">{row.name}</p>
            </div>
          ),
        },
        {
          key: "startDate",
          header: "Starts",
          render: (row) => (
            <span className="text-slate-600">{formatDate(row.startDate)}</span>
          ),
        },
        {
          key: "endDate",
          header: "Ends",
          render: (row) => (
            <span className="text-slate-600">{formatDate(row.endDate)}</span>
          ),
        },
        {
          key: "isCurrent",
          header: "Current",
          render: (row) => (
            <Badge status={row.isCurrent ? "ACTIVE" : "INACTIVE"}>
              {row.isCurrent ? "Current" : "Past"}
            </Badge>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        { name: "name", label: "Name", required: true, placeholder: "e.g. 2025-2026" },
        { name: "startDate", label: "Start date", type: "date", required: true },
        { name: "endDate", label: "End date", type: "date", required: true },
      ]}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Academic Year"
      editTitle="Edit Academic Year"
      toPayload={(values) => ({
        ...values,
        status: values.status || "INACTIVE",
      })}
    />
  );
}
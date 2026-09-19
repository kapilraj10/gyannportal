"use client";

import { sectionsApi } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/constants";

import type { Section } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SchoolAdminSectionsPage() {
  return (
    <CrudPage<Section>
      title="Sections"
      description="Sections belong to a class, e.g. Section A of Grade 6."
      role="SCHOOL_ADMIN"
      resource={{
        list: sectionsApi.list,
        create: resourceMutator(sectionsApi.create),
        update: resourceUpdater(sectionsApi.update),
        remove: sectionsApi.remove,
      }}
      columns={[
        {
          key: "name",
          header: "Section",
          render: (row) => (
            <div>
              <p className="font-medium text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-400">
                {row.class?.name ?? "No class"}
              </p>
            </div>
          ),
        },
        {
          key: "capacity",
          header: "Capacity",
          render: (row) => (
            <span className="text-slate-600">{row.capacity ?? "—"}</span>
          ),
        },
        {
          key: "enrollments",
          header: "Students",
          render: (row) => (
            <span className="text-slate-600">
              {row._count?.enrollments ?? 0}
            </span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        {
          name: "classId",
          label: "Class ID",
          required: true,
          hint: "Paste the class id from the Classes page.",
        },
        { name: "name", label: "Section name", required: true, placeholder: "e.g. A" },
        { name: "capacity", label: "Capacity", type: "number", step: "1" },
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
      createTitle="Add Section"
      editTitle="Edit Section"
    />
  );
}
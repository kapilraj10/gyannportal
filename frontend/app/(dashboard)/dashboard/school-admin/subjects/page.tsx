"use client";

import { BookOpen } from "lucide-react";

import { subjectsApi } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/constants";

import type { Subject } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SchoolAdminSubjectsPage() {
  return (
    <CrudPage<Subject>
      title="Subjects"
      description="Subjects taught in your school, e.g. Mathematics."
      role="SCHOOL_ADMIN"
      resource={{
        list: subjectsApi.list,
        create: resourceMutator(subjectsApi.create),
        update: resourceUpdater(subjectsApi.update),
        remove: subjectsApi.remove,
      }}
      columns={[
        {
          key: "name",
          header: "Subject",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-400">{row.code}</p>
              </div>
            </div>
          ),
        },
        {
          key: "description",
          header: "Description",
          render: (row) => (
            <span className="line-clamp-1 text-slate-500">
              {row.description ?? "—"}
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
        { name: "name", label: "Subject name", required: true, placeholder: "e.g. Mathematics" },
        { name: "code", label: "Code", required: true, placeholder: "e.g. MAT" },
        { name: "description", label: "Description", type: "textarea", full: true },
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
      createTitle="Add Subject"
      editTitle="Edit Subject"
    />
  );
}
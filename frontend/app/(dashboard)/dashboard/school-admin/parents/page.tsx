"use client";

import { Users } from "lucide-react";

import { parentsApi, studentsApi } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/constants";
import { useEffect, useState } from "react";

import type { Parent } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SchoolAdminParentsPage() {
  const [studentOptions, setStudentOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    void studentsApi
      .list({ page: 1, limit: 500 })
      .then((result) =>
        setStudentOptions(
          result.data.map((row) => ({
            label: row.user?.name ?? row.studentCode,
            value: row.id,
          })),
        ),
      )
      .catch(() => undefined);
  }, []);

  return (
    <CrudPage<Parent>
      title="Parents"
      description="Parent accounts linked to student records."
      role="SCHOOL_ADMIN"
      resource={{
        list: parentsApi.list,
        create: resourceMutator(parentsApi.create),
        update: resourceUpdater(parentsApi.update),
        remove: parentsApi.remove,
      }}
      columns={[
        {
          key: "user",
          header: "Parent",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  {row.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-400">{row.user?.email ?? ""}</p>
              </div>
            </div>
          ),
        },
        {
          key: "occupation",
          header: "Occupation",
          render: (row) => (
            <span className="text-slate-600">{row.occupation ?? "—"}</span>
          ),
        },
        {
          key: "children",
          header: "Children",
          render: (row) => (
            <span className="text-slate-600">
              {row._count?.children ?? row.children?.length ?? 0}
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
        { name: "name", label: "Full name", required: true, full: true },
        { name: "email", label: "Email", type: "email", full: true },
        { name: "phone", label: "Phone" },
        { name: "occupation", label: "Occupation" },
        { name: "childIds", label: "Children", hint: "Student IDs to link." },
        { name: "address", label: "Address", type: "textarea", full: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: statusOptions,
        },
      ]}
      selectOptions={{ childIds: studentOptions }}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Parent"
      editTitle="Edit Parent"
      toPayload={(values) => {
        const { childIds, ...rest } = values;
        return {
          ...rest,
          ...(Array.isArray(childIds) ? { childIds } : childIds ? { childIds: [childIds] } : {}),
        };
      }}
    />
  );
}
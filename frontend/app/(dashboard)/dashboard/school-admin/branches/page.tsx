"use client";

import { Building2 } from "lucide-react";

import { branchesApi } from "@/lib/api";

import type { Branch } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const branchStatusOptions = [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }];

export default function SchoolAdminBranchesPage() {
  return (
    <CrudPage<Branch>
      title="Branches"
      description="Campuses or branches belonging to your school."
      role="SCHOOL_ADMIN"
      resource={{
        list: branchesApi.list,
        create: resourceMutator(branchesApi.create),
        update: resourceUpdater(branchesApi.update),
        remove: branchesApi.remove,
      }}
      columns={[
        {
          key: "name",
          header: "Branch",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">{row.name}</p>
                {row.isMain && <p className="text-xs text-slate-400">Main branch</p>}
              </div>
            </div>
          ),
        },
        {
          key: "address",
          header: "Address",
          render: (row) => (
            <span className="line-clamp-1 text-slate-500">{row.address ?? "—"}</span>
          ),
        },
        {
          key: "phone",
          header: "Contact",
          render: (row) => (
            <div className="text-slate-600">
              <p>{row.phone ?? "—"}</p>
              <p className="text-xs text-slate-400">{row.email ?? ""}</p>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        { name: "name", label: "Branch name", required: true },
        { name: "address", label: "Address", type: "textarea", full: true },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email", type: "email" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: branchStatusOptions,
        },
      ]}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Branch"
      editTitle="Edit Branch"
    />
  );
}
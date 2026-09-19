"use client";

import { ClipboardList } from "lucide-react";

import { assignmentsApi } from "@/lib/api";
import { ASSIGNMENT_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

import type { Assignment } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

export default function SchoolAdminAssignmentsPage() {
  return (
    <CrudPage<Assignment>
      title="Assignments"
      description="Homework and assignments issued to students."
      role="SCHOOL_ADMIN"
      resource={{
        list: assignmentsApi.list,
        create: resourceMutator(assignmentsApi.create),
        update: resourceUpdater(assignmentsApi.update),
        remove: assignmentsApi.remove,
      }}
      columns={[
        {
          key: "title",
          header: "Assignment",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <ClipboardList className="h-4 w-4" />
              </span>
              <p className="font-medium text-slate-900">{row.title}</p>
            </div>
          ),
        },
        {
          key: "course",
          header: "Course / Class",
          render: (row) => (
            <span className="text-slate-600">
              {row.course?.name ?? row.class?.name ?? "—"}
            </span>
          ),
        },
        {
          key: "dueDate",
          header: "Due",
          render: (row) => (
            <span className="text-slate-500">{formatDate(row.dueDate)}</span>
          ),
        },
        {
          key: "maxMarks",
          header: "Max marks",
          render: (row) => (
            <span className="text-slate-600">{row.maxMarks ?? "—"}</span>
          ),
        },
        {
          key: "submissions",
          header: "Submissions",
          render: (row) => (
            <span className="text-slate-600">{row._count?.submissions ?? 0}</span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea", full: true },
        { name: "dueDate", label: "Due date", type: "date", required: true },
        { name: "maxMarks", label: "Max marks", type: "number", step: "0.01" },
        { name: "courseId", label: "Course ID", hint: "From the Courses page." },
        { name: "classId", label: "Class ID", hint: "Optional." },
        { name: "sectionId", label: "Section ID", hint: "Optional." },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ASSIGNMENT_STATUS_OPTIONS,
        },
      ]}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Assignment"
      editTitle="Edit Assignment"
    />
  );
}
"use client";

import { FileBarChart } from "lucide-react";

import { examsApi } from "@/lib/api";
import { EXAM_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

import type { Exam } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

export default function SchoolAdminExamsPage() {
  return (
    <CrudPage<Exam>
      title="Exams"
      description="Scheduled examinations for your classes."
      role="SCHOOL_ADMIN"
      resource={{
        list: examsApi.list,
        create: resourceMutator(examsApi.create),
        update: resourceUpdater(examsApi.update),
        remove: examsApi.remove,
      }}
      columns={[
        {
          key: "name",
          header: "Exam",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <FileBarChart className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-400">{row.examType ?? ""}</p>
              </div>
            </div>
          ),
        },
        {
          key: "class",
          header: "Class",
          render: (row) => (
            <span className="text-slate-600">{row.class?.name ?? "School-wide"}</span>
          ),
        },
        {
          key: "startDate",
          header: "Start",
          render: (row) => (
            <span className="text-slate-500">{formatDate(row.startDate)}</span>
          ),
        },
        {
          key: "endDate",
          header: "End",
          render: (row) => (
            <span className="text-slate-500">{formatDate(row.endDate)}</span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        { name: "name", label: "Exam name", required: true, placeholder: "e.g. First Term" },
        { name: "examType", label: "Exam type", placeholder: "e.g. Term / Midterm" },
        { name: "startDate", label: "Start date", type: "date", required: true },
        { name: "endDate", label: "End date", type: "date", required: true },
        { name: "classId", label: "Class ID", hint: "Optional; school-wide if empty." },
        { name: "academicYearId", label: "Academic Year ID", hint: "Optional." },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: EXAM_STATUS_OPTIONS,
        },
      ]}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Exam"
      editTitle="Edit Exam"
    />
  );
}
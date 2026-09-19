"use client";

import { resultsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

import type { Result } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";

function gradeColor(grade?: string | null): string {
  if (!grade) return "bg-slate-100 text-slate-600";
  const normalized = grade.trim().toUpperCase();
  if (["A+", "A", "A-"].includes(normalized)) return "bg-emerald-50 text-emerald-700";
  if (normalized.startsWith("B")) return "bg-blue-50 text-blue-700";
  if (normalized.startsWith("C")) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

export default function SchoolAdminResultsPage() {
  return (
    <CrudPage<Result>
      title="Results"
      description="Student marks recorded per exam and subject."
      role="SCHOOL_ADMIN"
      resource={{
        list: resultsApi.list,
        create: resourceMutator(resultsApi.create),
        update: resourceUpdater(resultsApi.update),
        remove: resultsApi.remove,
      }}
      columns={[
        {
          key: "student",
          header: "Student",
          render: (row) => (
            <div>
              <p className="font-medium text-slate-900">
                {row.student?.user?.name ?? "—"}
              </p>
              <p className="text-xs text-slate-400">
                {row.student?.studentCode ?? ""}
              </p>
            </div>
          ),
        },
        {
          key: "exam",
          header: "Exam",
          render: (row) => (
            <span className="text-slate-600">{row.exam?.name ?? "—"}</span>
          ),
        },
        {
          key: "subject",
          header: "Subject",
          render: (row) => (
            <span className="text-slate-600">{row.subject?.name ?? "—"}</span>
          ),
        },
        {
          key: "marks",
          header: "Marks",
          render: (row) => (
            <span className="font-semibold text-slate-800">
              {row.marksObtained}
              <span className="font-normal text-slate-400"> / {row.maxMarks}</span>
            </span>
          ),
        },
        {
          key: "grade",
          header: "Grade",
          render: (row) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${gradeColor(row.grade)}`}
            >
              {row.grade ?? "—"}
            </span>
          ),
        },
        {
          key: "createdAt",
          header: "Recorded",
          render: (row) => (
            <span className="text-slate-500">{formatDate(row.createdAt)}</span>
          ),
        },
      ]}
      fields={[
        { name: "examId", label: "Exam ID", required: true, hint: "From the Exams page." },
        { name: "studentId", label: "Student ID", required: true, hint: "From the Students page." },
        { name: "subjectId", label: "Subject ID", hint: "Optional." },
        { name: "marksObtained", label: "Marks obtained", type: "number", step: "0.01", required: true },
        { name: "maxMarks", label: "Max marks", type: "number", step: "0.01", required: true },
        { name: "grade", label: "Grade", placeholder: "e.g. A" },
        { name: "remarks", label: "Remarks", type: "textarea", full: true },
      ]}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Result"
      editTitle="Edit Result"
    />
  );
}
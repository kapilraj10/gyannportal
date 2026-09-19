"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

import { teachersApi } from "@/lib/api";
import { ASSIGNMENT_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

import type { Assignment } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

export default function TeacherAssignmentsPage() {
  const [courseOptions, setCourseOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    void teachersApi
      .getMyCourses()
      .then((result) => {
        const courses = Array.isArray(result) ? result : [];
        setCourseOptions(
          courses.map((course) => ({
            label: course.name,
            value: course.id,
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  return (
    <CrudPage<Assignment>
      title="My Assignments"
      description="Homework you have assigned to students."
      role="TEACHER"
      resource={{
        list: teachersApi.getMyAssignments,
        create: resourceMutator(teachersApi.createAssignment),
        update: resourceUpdater(teachersApi.updateAssignment),
        remove: teachersApi.deleteAssignment,
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
              <div>
                <p className="font-medium text-slate-900">{row.title}</p>
                <p className="text-xs text-slate-400">
                  {row.course?.name ?? row.class?.name ?? ""}
                </p>
              </div>
            </div>
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
        { name: "courseId", label: "Course", type: "select", options: courseOptions },
        { name: "classId", label: "Class ID", hint: "Optional." },
        { name: "sectionId", label: "Section ID", hint: "Optional." },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ASSIGNMENT_STATUS_OPTIONS,
        },
      ]}
      selectOptions={{ courseId: courseOptions }}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="New Assignment"
      editTitle="Edit Assignment"
    />
  );
}
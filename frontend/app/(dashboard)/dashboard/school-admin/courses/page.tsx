"use client";

import { GraduationCap } from "lucide-react";

import { coursesApi } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/constants";

import type { Course } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SchoolAdminCoursesPage() {
  return (
    <CrudPage<Course>
      title="Courses"
      description="A course links a subject to a class (and optionally a teacher)."
      role="SCHOOL_ADMIN"
      resource={{
        list: coursesApi.list,
        create: resourceMutator(coursesApi.create),
        update: resourceUpdater(coursesApi.update),
        remove: coursesApi.remove,
      }}
      columns={[
        {
          key: "name",
          header: "Course",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-400">{row.code}</p>
              </div>
            </div>
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
          key: "class",
          header: "Class",
          render: (row) => (
            <span className="text-slate-600">
              {row.class?.name ?? "—"}
              {row.section?.name ? ` · ${row.section.name}` : ""}
            </span>
          ),
        },
        {
          key: "teacher",
          header: "Teacher",
          render: (row) => (
            <span className="text-slate-600">
              {row.teacher?.user?.name ?? "—"}
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
        { name: "name", label: "Course name", required: true },
        { name: "code", label: "Code", required: true },
        { name: "subjectId", label: "Subject ID", required: true, hint: "From the Subjects page." },
        { name: "classId", label: "Class ID", required: true, hint: "From the Classes page." },
        { name: "teacherId", label: "Teacher ID", hint: "Optional; from the Teachers page." },
        { name: "sectionId", label: "Section ID", hint: "Optional." },
        { name: "academicYearId", label: "Academic Year ID", hint: "Optional." },
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
      createTitle="Add Course"
      editTitle="Edit Course"
    />
  );
}
"use client";

import { enrollmentsApi, studentsApi } from "@/lib/api";
import { ENROLLMENT_STATUS_OPTIONS } from "@/lib/constants";
import { useSelectOptions } from "@/hooks/use-select-options";
import { useEffect, useState } from "react";

import type { Enrollment } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

export default function SchoolAdminEnrollmentsPage() {
  const { classes, sections, academicYears } = useSelectOptions();
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
    <CrudPage<Enrollment>
      title="Enrollments"
      description="Student–class assignments for an academic year."
      role="SCHOOL_ADMIN"
      resource={{
        list: enrollmentsApi.list,
        create: resourceMutator(enrollmentsApi.create),
        update: resourceUpdater(enrollmentsApi.update),
        remove: enrollmentsApi.remove,
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
          key: "academicYear",
          header: "Year",
          render: (row) => (
            <span className="text-slate-600">
              {row.academicYear?.name ?? "—"}
            </span>
          ),
        },
        {
          key: "rollNumber",
          header: "Roll No",
          render: (row) => (
            <span className="text-slate-600">{row.rollNumber ?? "—"}</span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <Badge status={row.status}>{row.status}</Badge>,
        },
      ]}
      fields={[
        { name: "studentId", label: "Student", type: "select", options: studentOptions, required: true },
        { name: "classId", label: "Class", type: "select", options: classes, required: true },
        { name: "sectionId", label: "Section", type: "select", options: sections },
        { name: "academicYearId", label: "Academic year", type: "select", options: academicYears },
        { name: "rollNumber", label: "Roll number", type: "number", step: "1" },
        { name: "status", label: "Status", type: "select", options: ENROLLMENT_STATUS_OPTIONS },
      ]}
      selectOptions={{
        studentId: studentOptions,
        classId: classes,
        sectionId: sections,
        academicYearId: academicYears,
      }}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Enrollment"
      editTitle="Edit Enrollment"
    />
  );
}
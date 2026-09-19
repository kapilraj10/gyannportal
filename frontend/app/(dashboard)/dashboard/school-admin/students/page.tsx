"use client";

import { Users } from "lucide-react";

import { studentsApi } from "@/lib/api";
import { GENDER_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { useSelectOptions } from "@/hooks/use-select-options";
import { formatDate } from "@/lib/format";

import type { Student } from "@/types/domain";

import CrudPage, {
  resourceMutator,
  resourceUpdater,
} from "@/components/crud/CrudPage";
import Badge from "@/components/common/Badge";

const statusOptions = STATUS_OPTIONS.filter((s) => s.value !== "SUSPENDED");

export default function SchoolAdminStudentsPage() {
  const { classes, sections, academicYears } = useSelectOptions();

  return (
    <CrudPage<Student>
      title="Students"
      description="Student records and their accounts."
      role="SCHOOL_ADMIN"
      resource={{
        list: studentsApi.list,
        create: resourceMutator(studentsApi.create),
        update: resourceUpdater(studentsApi.update),
        remove: studentsApi.remove,
      }}
      columns={[
        {
          key: "user",
          header: "Student",
          render: (row) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  {row.user?.name ?? "—"}
                </p>
                <p className="text-xs text-slate-400">{row.studentCode}</p>
              </div>
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
          key: "guardian",
          header: "Guardian",
          render: (row) => (
            <div className="text-slate-600">
              <p>{row.guardianName ?? "—"}</p>
              <p className="text-xs text-slate-400">{row.guardianPhone ?? ""}</p>
            </div>
          ),
        },
        {
          key: "admissionDate",
          header: "Admitted",
          render: (row) => (
            <span className="text-slate-500">
              {row.admissionDate ? formatDate(row.admissionDate) : "—"}
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
        { name: "studentCode", label: "Student code", required: true },
        { name: "phone", label: "Phone" },
        { name: "dateOfBirth", label: "Date of birth", type: "date" },
        { name: "gender", label: "Gender", type: "select", options: GENDER_OPTIONS },
        { name: "admissionDate", label: "Admission date", type: "date" },
        { name: "bloodGroup", label: "Blood group" },
        { name: "academicYearId", label: "Academic year", type: "select", options: academicYears },
        { name: "classId", label: "Class", type: "select", options: classes },
        { name: "sectionId", label: "Section", type: "select", options: sections },
        { name: "guardianName", label: "Guardian name" },
        { name: "guardianPhone", label: "Guardian phone" },
        { name: "address", label: "Address", type: "textarea", full: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: statusOptions,
        },
      ]}
      selectOptions={{ classId: classes, sectionId: sections, academicYearId: academicYears }}
      rowKey={(row) => row.id}
      searchKey="search"
      canCreate
      canUpdate
      canDelete
      createTitle="Add Student"
      editTitle="Edit Student"
    />
  );
}
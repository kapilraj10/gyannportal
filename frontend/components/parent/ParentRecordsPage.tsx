"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { parentsApi } from "@/lib/api";
import { useParentChildren } from "@/hooks/use-parent-children";
import { formatDate, titleCase } from "@/lib/format";

import type {
  Assignment,
  Attendance,
  Exam,
  Result,
} from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import Badge from "@/components/common/Badge";
import { Select } from "@/components/ui";

type RecordsKind = "attendance" | "assignments" | "exams" | "results";

const KIND_CONFIG: Record<
  RecordsKind,
  { title: string; description: string }
> = {
  attendance: {
    title: "Attendance",
    description: "Your child's attendance records.",
  },
  assignments: {
    title: "Assignments",
    description: "Homework and tasks assigned to your child.",
  },
  exams: {
    title: "Exams",
    description: "Examinations scheduled for your child.",
  },
  results: {
    title: "Results",
    description: "Marks and grades earned by your child.",
  },
};

export default function ParentRecordsPage({ kind }: { kind: RecordsKind }) {
  return (
    <Suspense
      fallback={
        <DashboardShell role="PARENT">
          <LoadingState />
        </DashboardShell>
      }
    >
      <ParentRecordsView kind={kind} />
    </Suspense>
  );
}

function ParentRecordsView({ kind }: { kind: RecordsKind }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { children, loading: childrenLoading } = useParentChildren();

  const [studentId, setStudentId] = useState<string>(
    searchParams.get("studentId") ?? "",
  );
  const [rows, setRows] = useState<
    Attendance[] | Assignment[] | Exam[] | Result[]
  >([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const selectFirstIfUnset = useCallback(() => {
    if (!studentId && children.length > 0) {
      setStudentId(children[0].studentId);
    }
  }, [studentId, children]);

  useEffect(() => {
    selectFirstIfUnset();
  }, [selectFirstIfUnset]);

  const load = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const params = { page, limit: 20 };
      let result;

      if (kind === "attendance") {
        result = await parentsApi.getChildAttendance(studentId, params);
      } else if (kind === "assignments") {
        result = await parentsApi.getChildAssignments(studentId, params);
      } else if (kind === "exams") {
        result = await parentsApi.getChildExams(studentId, params);
      } else {
        result = await parentsApi.getChildResults(studentId, params);
      }

      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [kind, studentId, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleStudentChange(next: string) {
    setStudentId(next);
    setPage(1);
    router.replace(`/dashboard/parent/${kind}?studentId=${next}`);
  }

  const columns: ColumnDef<Record<string, unknown>>[] =
    kind === "attendance"
      ? [
          {
            key: "date",
            header: "Date",
            render: (row) => (
              <span className="text-slate-700">
                {formatDate(row.date as string)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <Badge status={row.status as string}>{String(row.status)}</Badge>
            ),
          },
          {
            key: "remarks",
            header: "Remarks",
            render: (row) => (
              <span className="text-slate-500">{String(row.remarks ?? "—")}</span>
            ),
          },
        ]
      : kind === "assignments"
        ? [
            {
              key: "title",
              header: "Assignment",
              render: (row) => (
                <p className="font-medium text-slate-900">{String(row.title)}</p>
              ),
            },
            {
              key: "course",
              header: "Course",
              render: (row) => {
                const course = row.course as { name?: string } | null;
                const className = row.class as { name?: string } | null;
                return (
                  <span className="text-slate-600">
                    {course?.name ?? className?.name ?? "—"}
                  </span>
                );
              },
            },
            {
              key: "dueDate",
              header: "Due",
              render: (row) => (
                <span className="text-slate-500">
                  {formatDate(row.dueDate as string)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge status={row.status as string}>{String(row.status)}</Badge>
              ),
            },
          ]
        : kind === "exams"
          ? [
              {
                key: "name",
                header: "Exam",
                render: (row) => (
                  <p className="font-medium text-slate-900">{String(row.name)}</p>
                ),
              },
              {
                key: "startDate",
                header: "Date range",
                render: (row) => (
                  <span className="text-slate-600">
                    {formatDate(row.startDate as string)} –{" "}
                    {formatDate(row.endDate as string)}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <Badge status={row.status as string}>{String(row.status)}</Badge>
                ),
              },
            ]
          : [
              {
                key: "exam",
                header: "Exam",
                render: (row) => (
                  <span className="text-slate-600">
                    {(row.exam as { name?: string } | null)?.name ?? "—"}
                  </span>
                ),
              },
              {
                key: "subject",
                header: "Subject",
                render: (row) => (
                  <span className="text-slate-600">
                    {(row.subject as { name?: string } | null)?.name ?? "—"}
                  </span>
                ),
              },
              {
                key: "marks",
                header: "Marks",
                render: (row) => (
                  <span className="font-semibold text-slate-800">
                    {String(row.marksObtained)}
                    <span className="font-normal text-slate-400">
                      {" "}
                      / {String(row.maxMarks)}
                    </span>
                  </span>
                ),
              },
              {
                key: "grade",
                header: "Grade",
                render: (row) => (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {String(row.grade ?? "—")}
                  </span>
                ),
              },
            ];

  const config = KIND_CONFIG[kind];

  return (
    <DashboardShell role="PARENT">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          children.length > 1 ? (
            <Select
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-56"
            >
              {children.map((child) => (
                <option key={child.id} value={child.studentId}>
                  {child.student?.user?.name ?? "Child"}
                </option>
              ))}
            </Select>
          ) : undefined
        }
      />

      {childrenLoading ? (
        <LoadingState />
      ) : !studentId ? (
        <EmptyState
          title="No children linked"
          description="Ask your school to link your students to your account."
        />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="Nothing here yet" description={`No ${titleCase(kind)} recorded.`} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          rowKey={(row) => String(row.id)}
          meta={meta}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </DashboardShell>
  );
}
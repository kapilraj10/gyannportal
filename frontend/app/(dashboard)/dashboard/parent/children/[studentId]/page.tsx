"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, FileBarChart, GraduationCap } from "lucide-react";

import { parentsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

import type { Attendance, Assignment, Exam, Result } from "@/types/domain";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import Badge from "@/components/common/Badge";
import { usePathname, useSearchParams } from "next/navigation";

interface ChildProfile {
  studentCode?: string;
  dateOfBirth?: string | null;
  gender?: string;
  address?: string | null;
  admissionDate?: string | null;
  bloodGroup?: string | null;
  guardianName?: string | null;
  class?: { name?: string } | null;
  section?: { name?: string } | null;
  user?: { name?: string; email?: string };
}

export default function ChildDetailPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const studentId =
      (searchParams.get("studentId") || pathname.split("/").pop()) ?? "";

  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!studentId) {
      setError("Missing student ID");
      setLoading(false);
      return;
    }

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          profileResult,
          attendanceResult,
          examsResult,
          resultsResult,
          assignmentsResult,
        ] = await Promise.all([
          parentsApi.getChildProfile(studentId),
          parentsApi.getChildAttendance(studentId, { page: 1, limit: 5 }),
          parentsApi.getChildExams(studentId, { page: 1, limit: 5 }),
          parentsApi.getChildResults(studentId, { page: 1, limit: 5 }),
          parentsApi.getChildAssignments(studentId, { page: 1, limit: 5 }),
        ]);

        setProfile(profileResult as ChildProfile | null);
        setAttendance(attendanceResult.data);
        setExams(examsResult.data);
        setResults(resultsResult.data);
        setAssignments(assignmentsResult.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  const name = profile?.user?.name ?? "Student";
  const className = profile?.class?.name ?? "—";
  const sectionName = profile?.section?.name ?? "";

  return (
    <DashboardShell role="PARENT">
      <PageHeader
        title={profile ? name : "Child"}
        description={
          profile
            ? `${className}${sectionName ? ` · ${sectionName}` : ""} — ${profile.studentCode ?? ""}`
            : "Loading…"
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <GraduationCap size={22} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">
                    {profile?.user?.email ?? ""}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["Admission", profile?.admissionDate ? formatDate(profile.admissionDate) : "—"],
                  ["Date of birth", profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : "—"],
                  ["Gender", profile?.gender ?? "—"],
                  ["Blood group", profile?.bloodGroup ?? "—"],
                  ["Guardian", profile?.guardianName ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="text-right font-medium text-slate-700">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarDays size={16} className="text-primary-600" />
                Recent attendance
              </h3>
              {attendance.length === 0 ? (
                <p className="text-sm text-slate-400">No records yet.</p>
              ) : (
                <ul className="space-y-2">
                  {attendance.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                    >
                      <span className="text-sm text-slate-700">
                        {formatDate(record.date)}
                      </span>
                      <Badge status={record.status}>{record.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileBarChart size={16} className="text-primary-600" />
                Upcoming exams
              </h3>
              {exams.length === 0 ? (
                <p className="text-sm text-slate-400">No exams scheduled.</p>
              ) : (
                <ul className="space-y-2">
                  {exams.map((exam) => (
                    <li
                      key={exam.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {exam.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
                        </p>
                      </div>
                      <Badge status={exam.status}>{exam.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardList size={16} className="text-primary-600" />
                Recent results
              </h3>
              {results.length === 0 ? (
                <p className="text-sm text-slate-400">No results yet.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((result) => (
                    <li
                      key={result.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {result.exam?.name ?? "Exam"}
                          {result.subject?.name ? ` · ${result.subject.name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-800">
                          {result.marksObtained} / {result.maxMarks}
                        </span>
                        <span
                          className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                        >
                          {result.grade ?? "—"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardList size={16} className="text-primary-600" />
                Recent assignments
              </h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-400">No assignments yet.</p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((assignment) => (
                    <li
                      key={assignment.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {assignment.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          Due {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                      <Badge status={assignment.status}>{assignment.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
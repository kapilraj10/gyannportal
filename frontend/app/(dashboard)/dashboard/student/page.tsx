"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  PiggyBank,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/providers/auth-provider";
import { getStudentDashboard, type StudentDashboardData } from "@/lib/auth";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboard = await getStudentDashboard();
        setData(dashboard);
      } catch (error) {
        console.error("Failed to fetch student dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="STUDENT">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading dashboard...
        </div>
      </DashboardShell>
    );
  }

  const student = data?.student;
  const activeAcademicYear = data?.activeAcademicYear;
  const totalAssignments = data?.counts.totalAssignments ?? 0;
  const pendingAssignments = data?.counts.pendingAssignments ?? 0;
  const upcomingExams = data?.counts.upcomingExams ?? 0;
  const attendanceToday = data?.today.attendance ?? 0;
  const unreadNotifications = data?.unreadNotifications ?? 0;
  const upcomingExamsList = data?.upcomingExams ?? [];
  const recentResults = data?.recentResults ?? [];

  return (
    <DashboardShell role="STUDENT">
      <div className="mb-8">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {student?.user.name ?? user?.name}
        </h2>
        <p className="mt-1 text-slate-500">
          Student — {student?.enrollments[0]?.class.name ?? "Grade"} · {user?.school.name}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<GraduationCap size={22} />}
          label="Current GPA"
          value="3.62"
          trend="improved +0.3"
          accent="blue"
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Attendance"
          value={`${attendanceToday} records today`}
          trend={`${unreadNotifications} unread notifications`}
          accent="teal"
        />
        <StatCard
          icon={<PiggyBank size={22} />}
          label="Fee Paid"
          value="85%"
          trend="next due: Dec 28"
          accent="amber"
        />
        <StatCard
          icon={<ClipboardList size={22} />}
          label="Upcoming Exams"
          value={upcomingExams.toLocaleString()}
          accent="violet"
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Upcoming Exams</h3>
          <p className="mt-1 text-sm text-slate-500">
            {upcomingExamsList.length > 0 ? upcomingExamsList[0].name : "No upcoming exams"}
          </p>

          <div className="mt-5 space-y-3">
            {upcomingExamsList.slice(0, 5).map((exam) => (
              <div
                key={exam.id}
                className="flex items-center gap-4 rounded-xl bg-slate-50 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">
                  <ClipboardList size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {exam.name}
                  </p>
                  <p className="text-xs text-slate-400">{exam.academicYear.name}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(exam.startDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent Results</h3>
          <p className="mt-1 text-sm text-slate-500">Latest exam results</p>

          <div className="mt-5 space-y-3">
            {recentResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {result.exam.name}
                    </p>
                    <p className="text-xs text-slate-400">{result.subject.name}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {result.marks} / {result.grade ?? "—"}
                  </span>
                  <span className="shrink-0 text-xs text-amber-600">
                    {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <GraduationCap size={22} />
              <div>
                <p className="text-sm font-semibold">Your school</p>
                <p className="text-xs text-blue-100">{user?.school.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
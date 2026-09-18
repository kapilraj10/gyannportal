"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  GraduationCap,
  PiggyBank,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/providers/auth-provider";
import { getParentDashboard, type ParentDashboardData } from "@/lib/auth";

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboard = await getParentDashboard();
        setData(dashboard);
      } catch (error) {
        console.error("Failed to fetch parent dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="PARENT">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading dashboard...
        </div>
      </DashboardShell>
    );
  }

  const children = data?.children ?? [];
  const totalChildren = data?.counts.totalChildren ?? 0;
  const totalAssignments = data?.counts.totalAssignments ?? 0;
  const pendingAssignments = data?.counts.pendingAssignments ?? 0;
  const upcomingExams = data?.counts.upcomingExams ?? 0;
  const attendanceToday = data?.today.attendance ?? 0;
  const unreadNotifications = data?.unreadNotifications ?? 0;
  const upcomingExamsList = data?.upcomingExams ?? [];
  const recentResults = data?.recentResults ?? [];

  const firstChild = children[0];

  return (
    <DashboardShell role="PARENT">
      <div className="mb-8">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {user?.name}
        </h2>
        <p className="mt-1 text-slate-500">
          Parent — staying connected with your child&apos;s education
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3">
            <Users size={28} />
          </div>

          <div>
            <p className="text-sm text-blue-100">My children</p>
            {firstChild ? (
              <>
                <h3 className="mt-1 text-2xl font-bold">{firstChild.user.name}</h3>
                <p className="mt-1 text-blue-100">
                  {firstChild.enrollments[0]?.class.name ?? "Grade"} · {firstChild.studentCode}
                </p>
                <p className="mt-1 text-blue-100">{user?.school.name}</p>
              </>
            ) : (
              <p className="mt-1 text-blue-100">No children linked yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={22} />}
          label="My Children"
          value={totalChildren.toLocaleString()}
          accent="blue"
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Today's Attendance"
          value={attendanceToday.toLocaleString()}
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
          icon={<AlertCircle size={22} />}
          label="Upcoming Exams"
          value={upcomingExams.toLocaleString()}
          trend={`${totalAssignments} total assignments`}
          accent="violet"
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Children Overview</h3>
          <p className="mt-1 text-sm text-slate-500">
            {children.length} child{children.length !== 1 ? "ren" : ""} linked
          </p>

          <div className="mt-5 space-y-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Users size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {child.user.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {child.enrollments[0]?.class.name ?? "No class"} · {child.studentCode}
                  </p>
                </div>
                <span
                  className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                >
                  {child.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent Results</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest progress and exam results
          </p>

          <div className="mt-5 space-y-3">
            {recentResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {result.student.user.name} — {result.exam.name}
                  </p>
                  <p className="text-xs text-slate-400">{result.subject.name}</p>
                </div>
                <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {result.marks} / {result.grade ?? "—"}
                </span>
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
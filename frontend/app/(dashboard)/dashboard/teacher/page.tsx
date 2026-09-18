"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/providers/auth-provider";
import { getTeacherDashboard, type TeacherDashboardData } from "@/lib/auth";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboard = await getTeacherDashboard();
        setData(dashboard);
      } catch (error) {
        console.error("Failed to fetch teacher dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="TEACHER">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading dashboard...
        </div>
      </DashboardShell>
    );
  }

  const myClasses = data?.counts.myClasses ?? 0;
  const myStudents = data?.counts.myStudents ?? 0;
  const myCourses = data?.counts.myCourses ?? 0;
  const pendingAssignments = data?.counts.pendingAssignments ?? 0;
  const pendingSubmissions = data?.counts.pendingSubmissions ?? 0;
  const ungradedSubmissions = data?.counts.ungradedSubmissions ?? 0;
  const attendanceToday = data?.today.attendance ?? 0;
  const unreadNotifications = data?.unreadNotifications ?? 0;
  const activeAcademicYear = data?.activeAcademicYear;
  const recentActivities = data?.recentActivities ?? [];

  return (
    <DashboardShell role="TEACHER">
      <div className="mb-8">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {user?.name}
        </h2>
        <p className="mt-1 text-slate-500">Teacher — {user?.school.name}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen size={22} />}
          label="My Classes"
          value={myClasses.toLocaleString()}
          accent="blue"
        />
        <StatCard
          icon={<Users size={22} />}
          label="My Students"
          value={myStudents.toLocaleString()}
          trend="across all classes"
          accent="teal"
        />
        <StatCard
          icon={<ClipboardList size={22} />}
          label="Pending Marks"
          value={ungradedSubmissions.toLocaleString()}
          trend="needs grading"
          accent="amber"
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Today's Attendance"
          value={attendanceToday.toLocaleString()}
          trend={`${unreadNotifications} unread notifications`}
          accent="violet"
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Today's Overview</h3>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">My Courses</p>
              <p className="text-lg font-semibold text-slate-900">{myCourses.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Pending Submissions</p>
              <p className="text-lg font-semibold text-slate-900">{pendingSubmissions.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Active Academic Year</p>
              <p className="text-lg font-semibold text-slate-900">
                {activeAcademicYear?.name ?? "Not set"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Unread Notifications</p>
              <p className="text-lg font-semibold text-slate-900">{unreadNotifications.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Quick Actions</h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Enter Marks", icon: ClipboardList },
              { label: "Take Attendance", icon: CalendarDays },
              { label: "Create Assignment", icon: BookOpen },
              { label: "My Students", icon: Users },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <div
                  key={action.label}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-blue-50 hover:border-blue-100"
                >
                  <Icon size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {action.label}
                  </span>
                </div>
              );
            })}
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
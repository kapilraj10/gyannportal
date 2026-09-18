"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/providers/auth-provider";
import { getSchoolAdminDashboard, type SchoolAdminDashboardData } from "@/lib/auth";

export default function SchoolAdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboard = await getSchoolAdminDashboard();
        setData(dashboard);
      } catch (error) {
        console.error("Failed to fetch school admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="SCHOOL_ADMIN">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading dashboard...
        </div>
      </DashboardShell>
    );
  }

  const students = data?.counts.students ?? 0;
  const teachers = data?.counts.teachers ?? 0;
  const parents = data?.counts.parents ?? 0;
  const classes = data?.counts.classes ?? 0;
  const sections = data?.counts.sections ?? 0;
  const subjects = data?.counts.subjects ?? 0;
  const courses = data?.counts.courses ?? 0;
  const exams = data?.counts.exams ?? 0;
  const assignments = data?.counts.assignments ?? 0;
  const attendanceToday = data?.today.attendance ?? 0;
  const noticesToday = data?.today.notices ?? 0;
  const activeAcademicYear = data?.activeAcademicYear;
  const recentActivities = data?.recentActivities ?? [];

  return (
    <DashboardShell role="SCHOOL_ADMIN">
      <div className="mb-8">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {user?.name}
        </h2>
        <p className="mt-1 text-slate-500">
          School Administrator — manage your entire school
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3">
            <GraduationCap size={28} />
          </div>

          <div>
            <p className="text-sm text-blue-100">Your institution</p>
            <h3 className="mt-1 text-2xl font-bold">{user?.school.name}</h3>
            <p className="mt-1 text-blue-100">Code: {user?.school.code}</p>
            {user?.branch && (
              <p className="mt-1 text-blue-100">Branch: {user.branch.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={22} />}
          label="Students"
          value={students.toLocaleString()}
          trend={activeAcademicYear ? `Academic Year: ${activeAcademicYear.name}` : "Current year"}
          accent="blue"
        />
        <StatCard
          icon={<GraduationCap size={22} />}
          label="Teachers"
          value={teachers.toLocaleString()}
          trend={`${classes} classes | ${sections} sections`}
          accent="teal"
        />
        <StatCard
          icon={<Wallet size={22} />}
          label="Fee Collection"
          value="NPR 2.4M"
          trend="89% collected"
          accent="amber"
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Today's Attendance"
          value={`${attendanceToday} records`}
          trend={`${noticesToday} notices today`}
          accent="violet"
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Academic Overview</h3>
          <p className="mt-1 text-sm text-slate-500">
            Current academic year details
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Academic Year</p>
              <p className="text-lg font-semibold text-slate-900">
                {activeAcademicYear?.name ?? "Not set"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Subjects</p>
              <p className="text-lg font-semibold text-slate-900">{subjects.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Courses</p>
              <p className="text-lg font-semibold text-slate-900">{courses.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Exams</p>
              <p className="text-lg font-semibold text-slate-900">{exams.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-500">Assignments</p>
              <p className="text-lg font-semibold text-slate-900">{assignments.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent Activities</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest actions in your school
          </p>

          <div className="mt-5 space-y-3">
            {recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-slate-100 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-400">
                        {activity.entity}
                        {activity.entityId ? ` (${activity.entityId})` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Branches</h3>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {user?.branch?.name ?? "Main Branch"}
                  </p>
                  <p className="text-xs text-slate-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
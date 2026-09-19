"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  Users,
} from "lucide-react";

import { teachersApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";

interface TeacherDashboard {
  teacher_id?: string;
  classes?: Array<{ id?: string; name?: string }>;
  courses?: Array<{ id?: string; name?: string }>;
  totalStudents?: number;
  todayAttendance?: number;
  pendingAssignments?: number;
  upcomingExams?: number;
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    void teachersApi
      .getDashboard()
      .then((result) => setData(result as TeacherDashboard))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const classes = data?.classes ?? [];
  const courses = data?.courses ?? [];
  const totalStudents = data?.totalStudents ?? 0;
  const todayAttendance = data?.todayAttendance ?? 0;
  const pendingAssignments = data?.pendingAssignments ?? 0;
  const upcomingExams = data?.upcomingExams ?? 0;

  return (
    <DashboardShell role="TEACHER">
      <WelcomeHeader
        name={user?.name ?? "Teacher"}
        subtitle={`Teacher — ${user?.school?.name ?? ""}${
          user?.teacher?.specialization
            ? ` · ${user.teacher.specialization}`
            : ""
        }`}
      />

      {loading ? (
        <LoadingState label="Loading your teaching dashboard…" />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={22} />}
              label="Students"
              value={totalStudents.toLocaleString()}
              trend="Across your classes"
              accent="blue"
            />
            <StatCard
              icon={<CalendarDays size={22} />}
              label="Attendance Today"
              value={`${todayAttendance} records`}
              trend="Marked so far"
              accent="teal"
            />
            <StatCard
              icon={<ClipboardList size={22} />}
              label="Pending Assignments"
              value={pendingAssignments.toLocaleString()}
              trend="Awaiting submissions"
              accent="amber"
            />
            <StatCard
              icon={<FileBarChart size={22} />}
              label="Upcoming Exams"
              value={upcomingExams.toLocaleString()}
              trend="In the schedule"
              accent="violet"
            />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">My Classes</h3>
                <Link
                  href="/dashboard/teacher/classes"
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {classes.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No classes assigned yet.
                  </p>
                ) : (
                  classes.slice(0, 6).map((item) => (
                    <div
                      key={item.id ?? item.name}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <GraduationCap size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">My Courses</h3>
                <Link
                  href="/dashboard/teacher/assignments"
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  Manage assignments <ArrowRight size={14} />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {courses.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No courses assigned yet.
                  </p>
                ) : (
                  courses.slice(0, 6).map((item) => (
                    <div
                      key={item.id ?? item.name}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                        <ClipboardList size={18} />
                      </span>
                      <p className="text-sm font-medium text-slate-800">
                        {item.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
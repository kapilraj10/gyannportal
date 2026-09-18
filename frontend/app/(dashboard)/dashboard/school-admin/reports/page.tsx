"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  User,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

interface ReportData {
  school: { id: string; name: string; code: string; status: string; logo: string | null };
  activeAcademicYear: { id: string; name: string; startDate: string; endDate: string; status: string } | null;
  counts: {
    students: number;
    teachers: number;
    parents: number;
    classes: number;
    sections: number;
    subjects: number;
    courses: number;
    exams: number;
    assignments: number;
  };
  today: { attendance: number; notices: number };
  recentActivities: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    user: { id: string; name: string; role: { name: string } };
  }>;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function SchoolAdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const response = await api.get<Envelope<ReportData>>("/school-admin/dashboard");
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell role="SCHOOL_ADMIN">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading reports...
        </div>
      </DashboardShell>
    );
  }

  const stats = [
    { label: "Students", value: data?.counts.students ?? 0, icon: GraduationCap, color: "blue" },
    { label: "Teachers", value: data?.counts.teachers ?? 0, icon: User, color: "teal" },
    { label: "Parents", value: data?.counts.parents ?? 0, icon: Users, color: "amber" },
    { label: "Classes", value: data?.counts.classes ?? 0, icon: Building2, color: "violet" },
    { label: "Subjects", value: data?.counts.subjects ?? 0, icon: FileText, color: "pink" },
    { label: "Exams", value: data?.counts.exams ?? 0, icon: CalendarDays, color: "green" },
  ];

  return (
    <DashboardShell role="SCHOOL_ADMIN">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">School analytics and reports</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Reports</h2>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Academic Overview</h3>
          <p className="mt-1 text-sm text-slate-500">Current academic year details</p>

          <div className="mt-5 space-y-3">
            {data?.activeAcademicYear && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Academic Year</p>
                <p className="text-lg font-semibold text-slate-900">{data.activeAcademicYear.name}</p>
                <p className="text-sm text-slate-400">
                  {new Date(data.activeAcademicYear.startDate).toLocaleDateString()} – {new Date(data.activeAcademicYear.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Sections</p>
              <p className="text-lg font-semibold text-slate-900">{data?.counts.sections ?? 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Courses</p>
              <p className="text-lg font-semibold text-slate-900">{data?.counts.courses ?? 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Assignments</p>
              <p className="text-lg font-semibold text-slate-900">{data?.counts.assignments ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Today's Activity</h3>
          <p className="mt-1 text-sm text-slate-500">Latest actions in your school</p>

          <div className="mt-5 space-y-3">
            {data?.recentActivities?.slice(0, 10).map((activity) => (
              <div key={activity.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{activity.action}</p>
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
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Export Data</h3>
        <p className="mt-1 text-sm text-slate-500">Download detailed reports in CSV format</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Student Report", description: "All students with details" },
            { label: "Teacher Report", description: "All teachers with classes" },
            { label: "Attendance Report", description: "Monthly attendance summary" },
            { label: "Fee Collection", description: "Fee payment status report" },
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-blue-50 hover:border-blue-100 text-left">
              <Download size={24} className="text-blue-600" />
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className="text-xs text-slate-400">{item.description}</span>
            </button>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
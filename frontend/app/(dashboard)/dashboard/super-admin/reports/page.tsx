"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  Download,
  FileText,
  GraduationCap,
  Search,
  User,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

interface School {
  id: string;
  name: string;
  code: string;
  status: string;
  createdAt: string;
  _count: { users: number; students: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: { name: string };
  createdAt: string;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

interface DashboardData {
  totalSchools: number;
  activeSchools: number;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
}

export default function SuperAdminReportsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const [schoolsRes, usersRes, dashboardRes] = await Promise.all([
        api.get<Envelope<School[]>>("/super-admin/schools", { params: { limit: 100 } }),
        api.get<Envelope<User[]>>("/super-admin/users", { params: { limit: 100 } }),
        api.get<Envelope<any>>("/super-admin/dashboard"),
      ]);
      const dashboardData = dashboardRes.data.data;
      setSchools(schoolsRes.data.data);
      setUsers(usersRes.data.data);
      setDashboard({
        totalSchools: dashboardData.schools?.total ?? 0,
        activeSchools: dashboardData.schools?.active ?? 0,
        totalUsers: dashboardData.users?.total ?? 0,
        totalStudents: dashboardData.profiles?.students ?? 0,
        totalTeachers: dashboardData.profiles?.teachers ?? 0,
        totalParents: dashboardData.profiles?.parents ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell role="SUPER_ADMIN">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading reports...
        </div>
      </DashboardShell>
    );
  }

  const stats = [
    { label: "Total Schools", value: dashboard?.totalSchools ?? 0, icon: Building2, color: "blue" },
    { label: "Active Schools", value: dashboard?.activeSchools ?? 0, icon: CheckCircle, color: "green" },
    { label: "Total Users", value: dashboard?.totalUsers ?? 0, icon: Users, color: "teal" },
    { label: "Students", value: dashboard?.totalStudents ?? 0, icon: GraduationCap, color: "violet" },
    { label: "Teachers", value: dashboard?.totalTeachers ?? 0, icon: FileText, color: "amber" },
    { label: "Parents", value: dashboard?.totalParents ?? 0, icon: CalendarDays, color: "pink" },
  ];

  return (
    <DashboardShell role="SUPER_ADMIN">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Platform-wide analytics and reports</p>
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
          <h3 className="font-semibold text-slate-900">School Growth</h3>
          <p className="mt-1 text-sm text-slate-500">Schools by status</p>
          <div className="mt-5 space-y-3">
            {schools.slice(0, 10).map((school) => (
              <div key={school.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Building2 size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{school.name}</p>
                  <p className="text-xs text-slate-400">{school.code}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>{school._count.users} users</span>
                  <span>{school._count.students} students</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{school.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent User Registrations</h3>
          <p className="mt-1 text-sm text-slate-500">Latest platform users</p>
          <div className="mt-5 space-y-3">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <User size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{user.role.name}</span>
                  <span className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
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
            { label: "Schools Report", description: "All schools with stats" },
            { label: "Users Report", description: "All users with roles" },
            { label: "Activity Report", description: "Platform activity logs" },
            { label: "Growth Report", description: "Monthly growth metrics" },
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
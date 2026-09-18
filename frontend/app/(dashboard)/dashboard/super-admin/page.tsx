"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  School,
  UserCheck,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/providers/auth-provider";
import { getSuperAdminDashboard, type SuperAdminDashboardData } from "@/lib/auth";

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboard = await getSuperAdminDashboard();
        setData(dashboard);
      } catch (error) {
        console.error("Failed to fetch super admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="SUPER_ADMIN">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading dashboard...
        </div>
      </DashboardShell>
    );
  }

  const totalSchools = data?.schools.total ?? 0;
  const activeSchools = data?.schools.active ?? 0;
  const suspendedSchools = data?.schools.suspended ?? 0;
  const pendingSchools = data?.schools.pending ?? 0;
  const totalUsers = data?.users.total ?? 0;
  const totalStudents = data?.profiles.students ?? 0;
  const totalTeachers = data?.profiles.teachers ?? 0;
  const totalParents = data?.profiles.parents ?? 0;
  const recentSchools = data?.recentSchools ?? [];
  const recentRegistrations = data?.recentRegistrations ?? [];

  return (
    <DashboardShell role="SUPER_ADMIN">
      <div className="mb-8">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {user?.name}
        </h2>
        <p className="mt-1 text-slate-500">
          Super Admin — platform overview
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3">
            <Building2 size={28} />
          </div>

          <div>
            <p className="text-sm text-blue-100">Platform</p>
            <h3 className="mt-1 text-2xl font-bold">GyannPortal Fleet</h3>
            <p className="mt-1 text-blue-100">
              All schools under the GyannPortal platform
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<School size={22} />}
          label="Total Schools"
          value={totalSchools.toLocaleString()}
          trend={`Active: ${activeSchools} | Suspended: ${suspendedSchools} | Pending: ${pendingSchools}`}
          accent="blue"
        />
        <StatCard
          icon={<Users size={22} />}
          label="Total Users"
          value={totalUsers.toLocaleString()}
          trend={`Students: ${totalStudents.toLocaleString()} | Teachers: ${totalTeachers.toLocaleString()} | Parents: ${totalParents.toLocaleString()}`}
          accent="teal"
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Active Schools"
          value={activeSchools.toLocaleString()}
          trend={`${Math.round(totalSchools ? (activeSchools / totalSchools) * 100 : 0)}% active`}
          accent="violet"
        />
        <StatCard
          icon={<Building2 size={22} />}
          label="Pending Schools"
          value={pendingSchools.toLocaleString()}
          accent="amber"
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">New Registrations</h3>
          <p className="mt-1 text-sm text-slate-500">
            Recent schools signing up to GyannPortal
          </p>

          <div className="mt-5 space-y-3">
            {recentSchools.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <School size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400">{item.code}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent User Registrations</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest users across the platform
          </p>

          <div className="mt-5 space-y-3">
            {recentRegistrations.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <UserCheck size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400">{item.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {item.role.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
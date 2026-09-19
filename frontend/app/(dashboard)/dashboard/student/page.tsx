"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GraduationCap,
} from "lucide-react";

import { studentsApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { formatDate } from "@/lib/format";

import type { Student } from "@/types/domain";

import DashboardShell from "@/components/DashboardShell";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    void studentsApi
      .getMyProfile()
      .then(setProfile)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Attendance",
      value: "View",
      href: "/dashboard/student/attendance",
      icon: CalendarDays,
      color: "text-primary-600 bg-primary-50",
    },
    {
      label: "Assignments",
      value: "View",
      href: "/dashboard/student/assignments",
      icon: ClipboardList,
      color: "text-teal-600 bg-teal-50",
    },
    {
      label: "Exams",
      value: "View",
      href: "/dashboard/student/exams",
      icon: FileBarChart,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Marks",
      value: "View",
      href: "/dashboard/student/marks",
      icon: FileBarChart,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <DashboardShell role="STUDENT">
      <WelcomeHeader
        name={profile?.user?.name ?? user?.name ?? "Student"}
        subtitle={`${profile?.class?.name ?? "Student"}${
          profile?.section?.name ? ` · ${profile.section.name}` : ""
        } — ${profile?.studentCode ?? ""}`}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group relative overflow-hidden rounded-2xl border border-deep-100 bg-white p-5 card-shadow card-hover transition hover:border-primary-200"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <Icon size={20} />
                  </span>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-500"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <GraduationCap size={22} />
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {profile?.user?.name ?? "Student"}
                </p>
                <p className="text-xs text-slate-400">
                  {profile?.user?.email ?? ""}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Class", profile?.class?.name ?? "—"],
                ["Section", profile?.section?.name ?? "—"],
                ["Admitted", profile?.admissionDate ? formatDate(profile.admissionDate) : "—"],
                ["Guardian", profile?.guardianName ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
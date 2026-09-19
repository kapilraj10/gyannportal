"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useParentChildren } from "@/hooks/use-parent-children";

import DashboardShell from "@/components/DashboardShell";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const { children, loading } = useParentChildren();

  return (
    <DashboardShell role="PARENT">
      <WelcomeHeader
        name={user?.name ?? "Parent"}
        subtitle="Parent — stay on top of your children&apos;s progress"
      />

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Users size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Children</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "—" : children.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-sm font-semibold text-slate-900">My Children</h3>

      {loading ? (
        <LoadingState />
      ) : children.length === 0 ? (
        <EmptyState
          title="No children linked"
          description="Ask your school to link your students to your account."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/dashboard/parent/children/${child.studentId}`}
              className="group relative overflow-hidden rounded-2xl border border-deep-100 bg-white p-5 card-shadow card-hover transition hover:border-primary-200"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <GraduationCap size={22} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {child.student?.user?.name ?? "Student"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {child.student?.studentCode ?? ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {child.student?.class?.name ?? "No class"}
                  {child.student?.section?.name
                    ? ` · ${child.student.section.name}`
                    : ""}
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-500"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
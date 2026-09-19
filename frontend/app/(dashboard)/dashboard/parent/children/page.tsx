"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

import { useParentChildren } from "@/hooks/use-parent-children";
import { titleCase } from "@/lib/format";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";

export default function ParentChildrenPage() {
  const { children, loading } = useParentChildren();

  return (
    <DashboardShell role="PARENT">
      <PageHeader
        title="My Children"
        description="Select a child to view their records."
      />

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
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
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
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {titleCase(child.relationship)}
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
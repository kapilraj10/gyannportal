"use client";

import { useEffect, useState } from "react";

import { teachersApi } from "@/lib/api";

import type { ClassEntity } from "@/types/domain";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    void teachersApi
      .getMyClasses()
      .then((result) => setClasses(result as ClassEntity[]))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell role="TEACHER">
      <PageHeader
        title="My Classes"
        description="Classes assigned to you this year."
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes assigned"
          description="Ask your school admin to assign you to courses."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-lg font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-400">{item.code}</p>
              <p className="mt-3 text-sm text-slate-500">
                {item.sections?.length
                  ? `${item.sections.length} section${item.sections.length === 1 ? "" : "s"}`
                  : "No sections"}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
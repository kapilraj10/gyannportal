"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

import { studentsApi } from "@/lib/api";

import type { ClassEntity } from "@/types/domain";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";

export default function StudentClassesPage() {
  const [rows, setRows] = useState<ClassEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    void studentsApi
      .getMyClasses()
      .then((result) => setRows(result as ClassEntity[]))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell role="STUDENT">
      <PageHeader
        title="My Classes"
        description="Classes you are enrolled in."
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No enrolled classes"
          description="Your school admin will assign you to classes."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <GraduationCap size={20} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.code}</p>
                </div>
              </div>
              {item.description && (
                <p className="mt-3 text-sm text-slate-500">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
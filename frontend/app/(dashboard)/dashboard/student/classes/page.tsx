"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  GraduationCap,
  Search,
  User,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

interface Enrollment {
  id: string;
  classId: string;
  sectionId: string;
  academicYearId: string;
  status: string;
  class: { id: string; name: string; code: string; academicYear: { id: string; name: string }; subjects: Array<{ id: string; name: string; code: string }> };
  section: { id: string; name: string; capacity: number };
  academicYear: { id: string; name: string };
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function StudentClassesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    setLoading(true);
    try {
      const response = await api.get<Envelope<Enrollment[]>>("/students/me/classes");
      setEnrollments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell role="STUDENT">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading classes...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="STUDENT">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Your enrolled classes and subjects</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Classes</h2>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <GraduationCap size={32} />
            </div>
            <p className="mt-4 text-slate-500">No classes enrolled yet</p>
            <p className="mt-1 text-sm text-slate-400">Contact your school admin for enrollment</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 transition">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {enrollment.class.name} {enrollment.section.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {enrollment.class.code} · {enrollment.academicYear.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle size={12} />
                      Active
                    </span>
                    <div className="text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{enrollment.class.subjects.length} subjects</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {enrollment.class.subjects.slice(0, 5).map((subject) => (
                      <span key={subject.id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <BookOpen size={12} />
                        {subject.name}
                      </span>
                    ))}
                    {enrollment.class.subjects.length > 5 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        +{enrollment.class.subjects.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
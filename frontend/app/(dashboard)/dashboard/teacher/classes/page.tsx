"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle,
  Edit,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

interface TeacherClass {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  class: { id: string; name: string; code: string; academicYear: { id: string; name: string } };
  section: { id: string; name: string; capacity: number };
  subject: { id: string; name: string; code: string };
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    setLoading(true);
    try {
      const response = await api.get<Envelope<TeacherClass[]>>("/teachers/me/classes");
      setClasses(response.data.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell role="TEACHER">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading classes...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="TEACHER">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Your assigned classes and subjects</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Classes</h2>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Assigned Classes</h3>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <BookOpen size={32} />
            </div>
            <p className="mt-4 text-slate-500">No classes assigned yet</p>
            <p className="mt-1 text-sm text-slate-400">Contact your school admin to get class assignments</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {classes.map((tc) => (
              <div key={tc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 transition">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {tc.class.name} {tc.section.name} – {tc.subject.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {tc.class.code} · {tc.subject.code} · {tc.class.academicYear.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle size={12} />
                      Active
                    </span>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Manage">
                      <Settings size={16} />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Edit">
                      <Edit size={16} />
                    </button>
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
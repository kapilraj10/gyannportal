"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  GraduationCap,
  Mail,
  Plus,
  Search,
  User,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

interface Child {
  id: string;
  studentCode: string;
  status: string;
  user: { id: string; name: string; email: string; phone?: string; avatar?: string };
  enrollments: Array<{ class: { name: string; code: string }; section: { name: string } }>;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  async function fetchChildren() {
    setLoading(true);
    try {
      const response = await api.get<Envelope<Child[]>>("/parents/me/children");
      setChildren(response.data.data);
    } catch (error) {
      console.error("Failed to fetch children:", error);
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "INACTIVE":
        return "bg-slate-100 text-slate-700";
      case "GRADUATED":
        return "bg-blue-100 text-blue-700";
      case "TRANSFERRED":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <DashboardShell role="PARENT">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading children...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="PARENT">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">View and manage your children's profiles</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Children</h2>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {children.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <User size={32} />
            </div>
            <p className="mt-4 text-slate-500">No children linked to your account</p>
            <p className="mt-1 text-sm text-slate-400">Contact school admin to link your children</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {children.map((child) => (
              <div key={child.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 transition">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{child.user.name}</div>
                      <div className="text-sm text-slate-500">{child.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(child.status)}`}>
                      {child.status}
                    </span>
                    <div className="text-sm text-slate-600">
                      {child.enrollments.map((e) => (
                        <div key={e.class.name} className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          <span>{e.class.name} {e.section.name}</span>
                        </div>
                      ))}
                    </div>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="View Details">
                      <User size={16} />
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

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "INACTIVE":
      return "bg-slate-100 text-slate-700";
    case "GRADUATED":
      return "bg-blue-100 text-blue-700";
    case "TRANSFERRED":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
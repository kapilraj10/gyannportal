"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CalendarDays,
  ClipboardList,
  Download,
  Search,
  Star,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";
import { api } from "@/lib/api";

interface Result {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  grade: string | null;
  remarks: string | null;
  publishedAt: string | null;
  createdAt: string;
  exam: { id: string; name: string };
  subject: { id: string; name: string; code: string };
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export default function StudentMarksPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [examFilter, setExamFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  useEffect(() => {
    fetchResults();
  }, [page, search, examFilter, subjectFilter]);

  async function fetchResults() {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "20" };
      if (search) params.search = search;
      if (examFilter) params.examId = examFilter;
      if (subjectFilter) params.subjectId = subjectFilter;

      const response = await api.get<Envelope<Result[]>>("/students/me/results", { params });
      setResults(response.data.data);
      setTotalPages(response.data.meta?.totalPages ?? 1);
      setTotal(response.data.meta?.total ?? 0);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && results.length === 0) {
    return (
      <DashboardShell role="STUDENT">
        <div className="flex min-h-[400px] items-center justify-center text-slate-500">
          Loading marks...
        </div>
      </DashboardShell>
    );
  }

  const publishedResults = results.filter((r) => r.publishedAt);
  const avgMarks = publishedResults.length > 0
    ? (publishedResults.reduce((sum, r) => sum + r.marks, 0) / publishedResults.length).toFixed(1)
    : "—";

  return (
    <DashboardShell role="STUDENT">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">View your exam results and grades</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Marks & Grades</h2>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download size={18} />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Average Marks</p>
              <p className="text-2xl font-bold text-slate-900">{avgMarks}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Exams Taken</p>
              <p className="text-2xl font-bold text-slate-900">{publishedResults.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Best Grade</p>
              <p className="text-2xl font-bold text-slate-900">
                {publishedResults.length > 0
                  ? publishedResults.reduce((best, r) => (r.grade && r.grade < best ? r.grade : best), "Z")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by exam, subject..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={examFilter}
                onChange={(e) => {
                  setExamFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Exams</option>
                <option value="mid-term">Mid Term</option>
                <option value="final">Final Exam</option>
                <option value="unit-test">Unit Test</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="space-y-2">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Award size={32} />
                      </div>
                      <p className="text-slate-500">No results available yet</p>
                      <p className="text-sm text-slate-400">Results will appear here once published</p>
                    </div>
                  </td>
                </tr>
              ) : (
                results.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">{result.exam.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{result.subject.name}</td>
                    <td className="px-6 py-4 text-center font-mono font-medium text-slate-900">{result.marks}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getGradeColor(result.grade)}`}>
                        {result.grade ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {result.publishedAt ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{result.remarks ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function getGradeColor(grade: string | null) {
  if (!grade) return "bg-slate-100 text-slate-700";
  if (["A+", "A", "A-"].includes(grade)) return "bg-green-100 text-green-700";
  if (["B+", "B", "B-"].includes(grade)) return "bg-blue-100 text-blue-700";
  if (["C+", "C", "C-"].includes(grade)) return "bg-amber-100 text-amber-700";
  if (["D+", "D", "D-"].includes(grade)) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}
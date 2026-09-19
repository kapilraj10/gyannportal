"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Save } from "lucide-react";

import { attendanceApi, studentsApi } from "@/lib/api";
import { ATTENDANCE_STATUS_OPTIONS } from "@/lib/constants";
import { useSelectOptions } from "@/hooks/use-select-options";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";

import type { Attendance, Student } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Badge from "@/components/common/Badge";
import { Button, Field, Input, Select } from "@/components/ui";

const todayInput = () => {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

export default function SchoolAdminAttendancePage() {
  const { classes, sections } = useSelectOptions();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(todayInput());
  const [records, setRecords] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  const [logs, setLogs] = useState<Attendance[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<unknown>(null);

  useEffect(() => {
    void studentsApi
      .list({ page: 1, limit: 1000 })
      .then((result) => setAllStudents(result.data))
      .catch(() => undefined);
  }, []);

  const filtered = allStudents.filter(
    (student) =>
      (!classId || student.class?.id === classId) &&
      (!sectionId || student.section?.id === sectionId),
  );

  useEffect(() => {
    const defaults: Record<string, string> = {};
    for (const student of filtered) defaults[student.id] = "PRESENT";
    setRecords((prev) => ({ ...defaults, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, sectionId, allStudents]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const result = await attendanceApi.list({ page, limit: 15 });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      setListError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  async function handleSave() {
    if (filtered.length === 0) return;

    setSaving(true);
    setSaveError(null);
    setSaved(null);

    const payload = {
      classId,
      sectionId: sectionId || undefined,
      date,
      records: filtered.map((student) => ({
        studentId: student.id,
        status: records[student.id] ?? "PRESENT",
        remarks: remarks[student.id],
      })),
    };

    try {
      await attendanceApi.mark(payload);
      setSaved(filtered.length);
      await loadLogs();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnDef<Attendance>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">
            {row.student?.user?.name ?? "—"}
          </p>
          <p className="text-xs text-slate-400">{row.student?.studentCode ?? ""}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="text-slate-500">{formatDate(row.date)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (row) => (
        <span className="text-slate-500">{row.remarks ?? "—"}</span>
      ),
    },
  ];

  return (
    <DashboardShell role="SCHOOL_ADMIN">
      <PageHeader
        title="Attendance"
        description="Mark daily attendance for a class, then review recent records."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select class</option>
              {classes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Section">
            <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">All sections</option>
              {sections.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <Button
              loading={saving}
              disabled={!classId || filtered.length === 0}
              onClick={() => void handleSave()}
              className="w-full"
            >
              <Save className="h-4 w-4" />
              Save attendance
            </Button>
          </div>
        </div>

        {saved !== null && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CalendarCheck className="h-4 w-4" />
            Attendance saved for {saved} student{saved === 1 ? "" : "s"}.
          </p>
        )}
        {saveError && (
          <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {saveError}
          </p>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Select a class to load students.
                  </td>
                </tr>
              )}
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {student.user?.name ?? "—"}
                    <span className="ml-2 text-xs text-slate-400">
                      {student.section?.name ?? ""}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <Select
                      value={records[student.id] ?? "PRESENT"}
                      onChange={(e) =>
                        setRecords((prev) => ({
                          ...prev,
                          [student.id]: e.target.value,
                        }))
                      }
                      className="w-32"
                    >
                      {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="py-3">
                    <Input
                      value={remarks[student.id] ?? ""}
                      onChange={(e) =>
                        setRemarks((prev) => ({
                          ...prev,
                          [student.id]: e.target.value,
                        }))
                      }
                      placeholder="Optional remark"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Recent attendance
        </h3>
        {listError ? (
          <ErrorState error={getErrorMessage(listError)} onRetry={() => void loadLogs()} />
        ) : logs.length === 0 && !loading ? (
          <EmptyState title="No records yet" description="Saved attendance appears here." />
        ) : (
          <DataTable
            columns={columns}
            rows={logs}
            rowKey={(row) => row.id}
            meta={meta}
            onPageChange={setPage}
            loading={loading}
          />
        )}
      </div>
    </DashboardShell>
  );
}
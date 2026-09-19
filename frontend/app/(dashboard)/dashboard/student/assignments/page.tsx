"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, ClipboardList } from "lucide-react";

import { assignmentsApi, studentsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";

import type { Assignment } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Modal from "@/components/common/Modal";
import Badge from "@/components/common/Badge";
import { Button, Field, Textarea } from "@/components/ui";

export default function StudentAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [submitFor, setSubmitFor] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitDone, setSubmitDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentsApi.getMyAssignments({ page, limit: 20 });
      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  function openSubmit(assignment: Assignment) {
    setSubmitFor(assignment);
    setSubmissionText("");
    setSubmitError(null);
    setSubmitDone(false);
  }

  async function handleSubmit() {
    if (!submitFor || !submissionText.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await assignmentsApi.submit(submitFor.id, { text: submissionText.trim() });
      setSubmitDone(true);
      await load();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const columns: ColumnDef<Assignment>[] = [
    {
      key: "title",
      header: "Assignment",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-400">
              {row.course?.name ?? row.class?.name ?? ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      render: (row) => (
        <span className="text-slate-500">{formatDate(row.dueDate)}</span>
      ),
    },
    {
      key: "maxMarks",
      header: "Max marks",
      render: (row) => (
        <span className="text-slate-600">{row.maxMarks ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        row.status === "PUBLISHED" ? (
          <Button variant="secondary" size="sm" onClick={() => openSubmit(row)}>
            <Send className="h-4 w-4" />
            Submit
          </Button>
        ) : null,
    },
  ];

  return (
    <DashboardShell role="STUDENT">
      <PageHeader
        title="My Assignments"
        description="Homework you are expected to submit."
      />

      {error ? (
        <ErrorState error={error} onRetry={() => void load()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="No assignments yet" />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          meta={meta}
          onPageChange={setPage}
          loading={loading}
        />
      )}

      <Modal
        open={!!submitFor}
        onClose={() => setSubmitFor(null)}
        title={submitFor ? `Submit: ${submitFor.title}` : "Submit assignment"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubmitFor(null)}>
              Cancel
            </Button>
            <Button
              loading={submitting}
              disabled={!submissionText.trim()}
              onClick={() => void handleSubmit()}
            >
              <Send className="h-4 w-4" />
              Submit
            </Button>
          </>
        }
      >
        {submitDone ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Assignment submitted successfully.
          </p>
        ) : (
          <>
            {submitError && (
              <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(submitError)}
              </div>
            )}
            <Field label="Your answer">
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={5}
                placeholder="Type your answer here…"
              />
            </Field>
          </>
        )}
      </Modal>
    </DashboardShell>
  );
}
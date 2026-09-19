"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Send } from "lucide-react";

import { notificationsApi } from "@/lib/api";
import { formatDateTime, titleCase } from "@/lib/format";
import { NOTIFICATION_TYPE_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";

import type { PaginationMeta } from "@/types/api";
import type { AppNotification } from "@/types/domain";

import DashboardShell from "@/components/DashboardShell";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Modal from "@/components/common/Modal";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import type { UserRole } from "@/lib/roles";

const TYPE_COLORS: Record<string, string> = {
  GENERAL: "bg-slate-100 text-slate-600",
  ANNOUNCEMENT: "bg-amber-50 text-amber-700",
  ATTENDANCE: "bg-violet-50 text-violet-700",
  ASSIGNMENT: "bg-teal-50 text-teal-700",
  EXAM: "bg-indigo-50 text-indigo-700",
  RESULT: "bg-emerald-50 text-emerald-700",
  FEE: "bg-rose-50 text-rose-700",
  EVENT: "bg-blue-50 text-blue-700",
};

export default function NotificationsPage({
  role,
  canSend = false,
}: {
  role: UserRole;
  canSend?: boolean;
}) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<unknown>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "GENERAL",
    recipientId: "",
  });

  const load = useCallback(async (nextPage = page) => {
    setLoading(true);
    setError(null);

    try {
      const result = await notificationsApi.list({ page: nextPage, limit: 15 });
      setItems(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    await notificationsApi.markRead(id).catch(() => undefined);
  }

  async function handleReadAll() {
    await notificationsApi.markAllRead().catch(() => undefined);
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }

  async function handleSend() {
    setSending(true);
    setSendError(null);

    try {
      await notificationsApi.send({
        title: form.title,
        message: form.message,
        type: form.type,
        ...(form.recipientId ? { recipientId: form.recipientId } : {}),
      });
      setComposeOpen(false);
      setForm({ title: "", message: "", type: "GENERAL", recipientId: "" });
      await load(1);
    } catch (err) {
      setSendError(err);
    } finally {
      setSending(false);
    }
  }

  const actions = (
    <>
      {canSend && (
        <Button onClick={() => setComposeOpen(true)}>
          <Send className="h-4 w-4" />
          Compose
        </Button>
      )}
      {items.some((item) => !item.isRead) ? (
        <button
          type="button"
          onClick={() => void handleReadAll()}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-600 ring-1 ring-slate-200 transition hover:bg-primary-50"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      ) : undefined}
    </>
  );

  return (
    <DashboardShell role={role}>
      <PageHeader
        title="Notifications"
        description="Messages sent to your account."
        actions={actions}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-6">
            <ErrorState error={getErrorMessage(error)} onRetry={() => void load()} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No notifications yet" description="You're all caught up." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => void handleRead(item.id)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${
                    item.isRead ? "opacity-70" : "bg-primary-50/30"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          TYPE_COLORS[item.type ?? ""] ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {titleCase(item.type ?? "GENERAL")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  {!item.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {meta && <Pagination meta={meta} onChange={setPage} />}

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Send notification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={sending}
              disabled={!form.title.trim() || !form.message.trim()}
              onClick={() => void handleSend()}
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </>
        }
      >
        {sendError ? (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {getErrorMessage(sendError)}
          </div>
        ) : null}

        <div className="space-y-4">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. School holiday announcement"
            />
          </Field>

          <Field label="Message">
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder="Write your message…"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Recipient user ID"
              hint="Leave empty to send to your whole audience."
            >
              <Input
                value={form.recipientId}
                onChange={(e) =>
                  setForm({ ...form, recipientId: e.target.value })
                }
                placeholder="Optional user id"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
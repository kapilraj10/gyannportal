"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { notificationsApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AppNotification } from "@/types/domain";

/**
 * Notification bell backed by `GET /notifications`.
 * Polls the endpoint; opening the menu marks unread items as read.
 */
export default function NotificationBell({
  basePath,
}: {
  basePath: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const result = await notificationsApi.list({ limit: 8 });
      setItems(result.data);
      setUnread(result.unread ?? result.meta?.total ?? 0);
    } catch {
      // Ignore — the bell should stay quiet on transient errors.
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setLoading(true);
        notificationsApi
          .markAllRead()
          .catch(() => undefined)
          .finally(() => {
            setUnread(0);
            void load();
            setLoading(false);
          });
      }
      return next;
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    notificationsApi
                      .markAllRead()
                      .catch(() => undefined)
                      .finally(() => {
                        setUnread(0);
                        void load();
                        setLoading(false);
                      });
                  }}
                  className="flex items-center gap-1 rounded-lg p-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Read all
                </button>
              )}
              <Link
                href={`${basePath}/notifications`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-xs text-slate-400">
                Loading…
              </p>
            )}

            {!loading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet
              </p>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className={`border-b border-slate-50 px-4 py-3 ${
                  item.isRead ? "opacity-70" : "bg-primary-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">
                    {item.title}
                  </p>
                  {!item.isRead && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                  {item.message}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle,
  Download,
  FileText,
  Search,
  XCircle,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";

interface Notice {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string };
  studentId?: string;
  studentName?: string;
}

const mockNotices: Notice[] = [
  {
    id: "1",
    title: "Parent-Teacher Meeting",
    message: "Dear Parents, You are invited to the Parent-Teacher Meeting scheduled for December 15th, 2024 at 10:00 AM. Please arrive 15 minutes early.",
    type: "ANNOUNCEMENT",
    isRead: false,
    createdAt: "2026-12-10T09:00:00Z",
    sender: { name: "School Administration" },
  },
  {
    id: "2",
    title: "Annual Sports Day",
    message: "The Annual Sports Day will be held on December 22nd, 2024. Students should wear sports uniform. Parents are welcome to attend.",
    type: "ANNOUNCEMENT",
    isRead: true,
    createdAt: "2026-12-08T14:30:00Z",
    sender: { name: "Sports Department" },
  },
  {
    id: "3",
    title: "Winter Vacation Notice",
    message: "Winter vacation will start from December 29th, 2024. School will resume on January 12th, 2025. Please ensure all assignments are completed before vacation.",
    type: "INFO",
    isRead: false,
    createdAt: "2026-12-05T11:00:00Z",
    sender: { name: "Principal Office" },
  },
  {
    id: "4",
    title: "Fee Payment Reminder",
    message: "This is a reminder that the Term 1 tuition fee payment is due by December 28th, 2024. Please make the payment to avoid late fees.",
    type: "WARNING",
    isRead: true,
    createdAt: "2026-12-01T10:00:00Z",
    sender: { name: "Accounts Department" },
  },
  {
    id: "5",
    title: "Mid-Term Exam Results",
    message: "Mid-term exam results have been published. Please log in to the portal to view your child's results.",
    type: "SUCCESS",
    isRead: false,
    createdAt: "2026-11-28T16:00:00Z",
    sender: { name: "Examination Department" },
  },
];

const NOTICE_TYPE_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  ANNOUNCEMENT: { bg: "bg-blue-100", text: "text-blue-700", icon: <Bell size={14} className="text-blue-600" /> },
  INFO: { bg: "bg-teal-100", text: "text-teal-700", icon: <FileText size={14} className="text-teal-600" /> },
  WARNING: { bg: "bg-amber-100", text: "text-amber-700", icon: <AlertCircle size={14} className="text-amber-600" /> },
  SUCCESS: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle size={14} className="text-green-600" /> },
  ERROR: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle size={14} className="text-red-600" /> },
};

export default function ParentNoticesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");

  const filteredNotices = mockNotices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(search.toLowerCase()) ||
      notice.message.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || notice.type === typeFilter;
    const matchesRead = readFilter === "all" || (readFilter === "read" ? notice.isRead : !notice.isRead);
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = mockNotices.filter((n) => !n.isRead).length;

  return (
    <DashboardShell role="PARENT">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">School notices and announcements</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Notices</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {unreadCount} unread
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="SUCCESS">Success</option>
                <option value="ERROR">Error</option>
              </select>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value as "all" | "read" | "unread")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <CheckCircle size={16} />
                Mark All Read
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredNotices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell size={32} />
              </div>
              <p className="mt-4 text-slate-500">No notices found</p>
            </div>
          ) : (
            <>
              {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`px-6 py-5 transition ${!notice.isRead ? "bg-blue-50" : "bg-white"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${NOTICE_TYPE_STYLES[notice.type]?.bg ?? "bg-slate-100"}`}>
                        {NOTICE_TYPE_STYLES[notice.type]?.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold text-slate-900 ${!notice.isRead ? "text-blue-900" : ""}`}>
                            {notice.title}
                          </h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${NOTICE_TYPE_STYLES[notice.type]?.bg ?? "bg-slate-100"} ${NOTICE_TYPE_STYLES[notice.type]?.text ?? "text-slate-700"}`}>
                            {notice.type}
                          </span>
                          {!notice.isRead && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">New</span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{notice.message}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            {new Date(notice.createdAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bell size={12} />
                            {notice.sender.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!notice.isRead && (
                      <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                        Mark Read
                      </button>
                    )}
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  GraduationCap,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";

interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  className: string;
  section: string;
  dayOfWeek: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherTimetablePage() {
  const [activeView, setActiveView] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(0);

  const mockTimetable: Period[] = [
    { id: "1", name: "Period 1", startTime: "08:00", endTime: "08:45", subject: "Mathematics", teacher: "You", className: "Grade 10 A", section: "A", dayOfWeek: 0 },
    { id: "2", name: "Period 2", startTime: "08:50", endTime: "09:35", subject: "Physics", teacher: "P. Rai", className: "Grade 10 B", section: "B", dayOfWeek: 0 },
    { id: "3", name: "Period 3", startTime: "09:40", endTime: "10:25", subject: "Free Period", teacher: "—", className: "—", section: "—", dayOfWeek: 0 },
    { id: "4", name: "Period 4", startTime: "10:35", endTime: "11:20", subject: "Mathematics", teacher: "You", className: "Grade 9 A", section: "A", dayOfWeek: 0 },
    { id: "5", name: "Period 1", startTime: "08:00", endTime: "08:45", subject: "Free Period", teacher: "—", className: "—", section: "—", dayOfWeek: 1 },
    { id: "6", name: "Period 2", startTime: "08:50", endTime: "09:35", subject: "Mathematics", teacher: "You", className: "Grade 10 A", section: "A", dayOfWeek: 1 },
    { id: "7", name: "Period 3", startTime: "09:40", endTime: "10:25", subject: "Physics", teacher: "P. Rai", className: "Grade 10 B", section: "B", dayOfWeek: 1 },
    { id: "8", name: "Period 4", startTime: "10:35", endTime: "11:20", subject: "Free Period", teacher: "—", className: "—", section: "—", dayOfWeek: 1 },
    { id: "9", name: "Period 1", startTime: "08:00", endTime: "08:45", subject: "Mathematics", teacher: "You", className: "Grade 9 A", section: "A", dayOfWeek: 2 },
    { id: "10", name: "Period 2", startTime: "08:50", endTime: "09:35", subject: "Free Period", teacher: "—", className: "—", section: "—", dayOfWeek: 2 },
  ];

  const getPeriodsForDay = (day: number) => mockTimetable.filter((p) => p.dayOfWeek === day);

  return (
    <DashboardShell role="TEACHER">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Your teaching schedule</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Timetable</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <CalendarDays size={18} />
              This Week
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(index);
                    setActiveView("day");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeView === "day" && selectedDay === index
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView("week")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeView === "week"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Week View
              </button>
            </div>
          </div>
        </div>

        {activeView === "week" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {["08:00-08:45", "08:50-09:35", "09:40-10:25", "10:35-11:20", "11:25-12:10", "12:10-12:55", "01:40-02:25", "02:30-03:15"].map((time) => (
                  <tr key={time}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-600 bg-slate-50 whitespace-nowrap">{time}</td>
{DAYS.map((day, dayIndex) => {
                      const period = mockTimetable.find(
                        (p) => p.dayOfWeek === dayIndex && p.startTime === time.split("-")[0]
                      );
                      const isYours = period?.teacher === "You";
                      return (
                        <td key={day} className="px-2 py-2">
                          {period ? (
                            <div className={`h-full min-h-[80px] p-2 rounded-lg border ${
                              isYours
                                ? "bg-blue-50 border-blue-200"
                                : "bg-slate-50 border-slate-100"
                            }`}>
                              <div className={`text-xs font-medium ${isYours ? "text-blue-800" : "text-slate-600"}`}>
                                {period.subject}
                              </div>
                              <div className="text-xs text-slate-500">{period.teacher}</div>
                              <div className="text-xs text-slate-400">{period.className} {period.section}</div>
                              {isYours && (
                                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                  <User size={10} />
                                  You
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-[80px] flex items-center justify-center text-slate-300 text-xs">
                              —
                            </div>
                          )}
                      </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="font-semibold text-slate-900">{DAYS[selectedDay]}'s Schedule</h3>
            <div className="mt-4 space-y-3">
              {getPeriodsForDay(selectedDay).map((period) => {
                const isYours = period.teacher === "You";
                return (
                  <div key={period.id} className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${isYours ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${isYours ? "bg-blue-600" : "bg-slate-600"} text-white text-sm font-bold`}>
                      {period.name.slice(-1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isYours ? "text-blue-900" : "text-slate-900"}`}>{period.subject}</div>
                      <div className="text-sm text-slate-500">{period.teacher} · {period.className} {period.section}</div>
                    </div>
                    <div className="shrink-0 text-sm text-slate-500">
                      {period.startTime} – {period.endTime}
                    </div>
                    {isYours && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <User size={12} />
                        Your class
                      </span>
                    )}
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                      <Settings size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
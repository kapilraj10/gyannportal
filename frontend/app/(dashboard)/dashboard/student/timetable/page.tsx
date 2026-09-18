"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  GraduationCap,
  Plus,
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

export default function StudentTimetablePage() {
  const [activeView, setActiveView] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(0);

  const mockTimetable: Period[] = [
    { id: "1", name: "Period 1", startTime: "08:00", endTime: "08:45", subject: "Mathematics", teacher: "A. Gurung", className: "Grade 8", section: "A", dayOfWeek: 0 },
    { id: "2", name: "Period 2", startTime: "08:50", endTime: "09:35", subject: "English", teacher: "P. Rai", className: "Grade 8", section: "A", dayOfWeek: 0 },
    { id: "3", name: "Period 3", startTime: "09:40", endTime: "10:25", subject: "Science", teacher: "S. Sharma", className: "Grade 8", section: "A", dayOfWeek: 0 },
    { id: "4", name: "Period 4", startTime: "10:35", endTime: "11:20", subject: "Computer", teacher: "K. Joshi", className: "Grade 8", section: "A", dayOfWeek: 0 },
    { id: "5", name: "Period 1", startTime: "08:00", endTime: "08:45", subject: "Social Studies", teacher: "R. Thapa", className: "Grade 8", section: "A", dayOfWeek: 1 },
    { id: "6", name: "Period 2", startTime: "08:50", endTime: "09:35", subject: "Mathematics", teacher: "A. Gurung", className: "Grade 8", section: "A", dayOfWeek: 1 },
    { id: "7", name: "Period 3", startTime: "09:40", endTime: "10:25", subject: "Nepali", teacher: "M. Karki", className: "Grade 8", section: "A", dayOfWeek: 1 },
    { id: "8", name: "Period 4", startTime: "10:35", endTime: "11:20", subject: "HPE", teacher: "S. Lama", className: "Grade 8", section: "A", dayOfWeek: 1 },
  ];

  const getPeriodsForDay = (day: number) => mockTimetable.filter((p) => p.dayOfWeek === day);

  return (
    <DashboardShell role="STUDENT">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Your class schedule</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Timetable</h2>
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
                      return (
                        <td key={day} className="px-2 py-2">
                          {period ? (
                            <div className="h-full min-h-[80px] p-2 rounded-lg bg-teal-50 border border-teal-100">
                              <div className="text-xs font-medium text-teal-800">{period.subject}</div>
                              <div className="text-xs text-teal-600">{period.teacher}</div>
                              <div className="text-xs text-teal-500">{period.className} {period.section}</div>
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
              {getPeriodsForDay(selectedDay).map((period) => (
                <div key={period.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white text-sm font-bold">
                    {period.name.slice(-1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{period.subject}</div>
                    <div className="text-sm text-slate-500">{period.teacher} · {period.className} {period.section}</div>
                  </div>
                  <div className="shrink-0 text-sm text-slate-500">
                    {period.startTime} – {period.endTime}
                  </div>
                  <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                    <Settings size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
"use client";

import { useEffect, useRef } from "react";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-fade-up");
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

export default function DashboardShowcase() {
  const ref = useInView(0.1);

  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16 opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
            <span className="text-xs font-medium text-primary-600">Dashboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            See your school
            <br />
            <span className="gradient-text">at a glance.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A clean, powerful dashboard gives administrators a complete overview of
            school operations in real time.
          </p>
        </div>

        {/* Full Dashboard Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-200/30 to-accent-200/30 rounded-3xl blur-2xl" />
          <div className="relative bg-white rounded-2xl card-shadow-lg overflow-hidden border border-slate-100">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-lg border border-slate-200 px-3 py-1.5 flex items-center gap-2 max-w-md">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
                  </svg>
                  <span className="text-xs text-slate-500">app.gyannportal.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex min-h-[500px]">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-56 bg-slate-50 border-r border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                  <span className="text-sm font-bold text-slate-800">GyannPortal</span>
                </div>
                <nav className="space-y-1 flex-1">
                  {[
                    { label: "Dashboard", active: true, icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" },
                    { label: "Students", active: false, icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
                    { label: "Teachers", active: false, icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25" },
                    { label: "Attendance", active: false, icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
                    { label: "Fees", active: false, icon: "M12 6v12m-3-2.818.879.659 1.171-1.671.879.659-1.17 1.671.879.659-1.171 1.671M12 6c1.162 0 2.317.14 3.428.403" },
                    { label: "Exams", active: false, icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25" },
                    { label: "Timetable", active: false, icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" },
                    { label: "Library", active: false, icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292" },
                    { label: "Reports", active: false, icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.active
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 sm:p-6 overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Dashboard</h3>
                    <p className="text-xs text-slate-400">Welcome back, Ramesh Admin</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                      <span className="text-xs text-slate-400">Search...</span>
                    </div>
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">RA</div>
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Total Students", value: "1,248", icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952", color: "text-blue-600 bg-blue-50" },
                    { label: "Present Today", value: "1,175", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", color: "text-emerald-600 bg-emerald-50" },
                    { label: "Fee Collected", value: "NPR 24.5L", icon: "M12 6v12m-3-2.818", color: "text-amber-600 bg-amber-50" },
                    { label: "Pending Fees", value: "NPR 3.2L", icon: "M12 6v12m-3-2.818", color: "text-rose-600 bg-rose-50" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-3.5">
                      <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Attendance Chart */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-700">Weekly Attendance</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" />Present</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200" />Absent</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-3 h-32">
                      {[
                        { present: 94, absent: 6 },
                        { present: 91, absent: 9 },
                        { present: 96, absent: 4 },
                        { present: 89, absent: 11 },
                        { present: 95, absent: 5 },
                        { present: 97, absent: 3 },
                        { present: 93, absent: 7 },
                      ].map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5">
                          <div
                            className="w-full rounded-sm"
                            style={{ height: `${day.present}%`, background: "linear-gradient(180deg, #1e40af, #0d9488)" }}
                          />
                          <div className="w-full rounded-sm bg-slate-100" style={{ height: `${day.absent}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Exams */}
                  <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Upcoming Exams</p>
                    <div className="space-y-3">
                      {[
                        { name: "Mid-term", grade: "Grade 10", date: "Sep 25", color: "bg-blue-500" },
                        { name: "Unit Test", grade: "Grade 8", date: "Oct 2", color: "bg-emerald-500" },
                        { name: "Pre-board", grade: "Grade 12", date: "Oct 15", color: "bg-violet-500" },
                      ].map((exam) => (
                        <div key={exam.name} className="flex items-center gap-3">
                          <div className={`w-1 h-8 rounded-full ${exam.color} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{exam.name}</p>
                            <p className="text-[10px] text-slate-400">{exam.grade} &middot; {exam.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Announcements */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Recent Announcements</p>
                    <div className="space-y-2.5">
                      {[
                        { text: "Annual day celebration on October 20th", time: "2h ago", type: "Event" },
                        { text: "Parent-teacher meeting scheduled for Grade 9", time: "5h ago", type: "Meeting" },
                        { text: "New library hours: 8 AM - 4 PM", time: "1d ago", type: "Notice" },
                        { text: "Sports day practice starts next week", time: "2d ago", type: "Activity" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-600 rounded-md shrink-0">{item.type}</span>
                          <p className="text-xs text-slate-600 flex-1 leading-relaxed">{item.text}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">September 2026</p>
                    <div className="grid grid-cols-7 gap-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                        <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
                      ))}
                      {[0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day, i) => {
                        const isToday = day === 17;
                        const hasEvent = [20, 25].includes(day);
                        return (
                          <div
                            key={i}
                            className={`text-center text-[10px] py-1.5 rounded-lg relative ${
                              day === 0 ? "invisible" :
                              isToday ? "bg-primary-500 text-white font-semibold" :
                              hasEvent ? "bg-primary-50 text-primary-600 font-medium" :
                              "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {day === 0 ? "" : day}
                            {hasEvent && !isToday && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

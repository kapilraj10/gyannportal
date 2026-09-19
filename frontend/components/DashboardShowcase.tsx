"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionHeading from "./shared/SectionHeading";

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const sidebarNav = [
  "Dashboard",
  "Students",
  "Teachers",
  "Attendance",
  "Exams",
  "Timetable",
  "Reports",
];

const weekData = [
  { present: 94, absent: 6 },
  { present: 91, absent: 9 },
  { present: 96, absent: 4 },
  { present: 89, absent: 11 },
  { present: 95, absent: 5 },
  { present: 97, absent: 3 },
  { present: 93, absent: 7 },
];

const announcements = [
  { text: "Annual day celebration on October 20th", meta: "Event · 2h ago" },
  { text: "Parent-teacher meeting scheduled for Grade 9", meta: "Meeting · 5h ago" },
  { text: "New library hours: 8 AM – 4 PM", meta: "Notice · 1d ago" },
];

const calEvents = new Set([20, 25]);

export default function DashboardShowcase() {
  const { ref, inView } = useInView(0.2);

  return (
    <section id="showcase" className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_40%,black,transparent)]" />
      </div>

      <div className="container-px relative max-w-7xl">
        <SectionHeading
          badge="Product tour"
          title={
            <>
              See your school
              <br />
              <span className="gradient-text">at a glance.</span>
            </>
          }
          subtitle="A clean, powerful dashboard gives administrators a complete, real-time view of the entire school."
        />

        {/* Floating callouts (desktop only) */}
        <div className="pointer-events-none absolute left-2 top-[44%] z-20 hidden animate-float-slower items-center gap-2.5 rounded-xl border border-deep-100 bg-white p-3 shadow-glow xl:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-deep-900">Attendance synced</p>
            <p className="text-[10px] text-deep-400">1,150 present today</p>
          </div>
        </div>

        <div className="pointer-events-none absolute right-2 top-[58%] z-20 hidden animate-float-delayed items-center gap-2.5 rounded-xl border border-deep-100 bg-white p-3 shadow-glow xl:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659 1.171-1.671.879.659-1.17 1.671.879.659-1.171 1.671M12 6c1.162 0 2.317.14 3.428.403" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-deep-900">Fee reminder sent</p>
            <p className="text-[10px] text-deep-400">23 parents notified</p>
          </div>
        </div>

        {/* Phone preview */}
        <div className="absolute -right-10 top-[30%] z-20 hidden w-40 animate-float-slow xl:block">
          <div className="rounded-[2.2rem] border border-deep-100 bg-deep-900 p-2 shadow-glow">
            <div className="overflow-hidden rounded-[1.8rem] bg-white">
              <div className="flex items-center justify-between px-4 pb-1 pt-4">
                <span className="text-[8px] font-semibold text-deep-800">9:41</span>
                <span className="h-1.5 w-6 rounded-full bg-deep-200" />
              </div>
              <div className="px-3.5">
                <p className="text-[9px] font-medium text-deep-400">Welcome back, Aarav</p>
                <p className="text-[11px] font-bold text-deep-900">Attendance 94%</p>
                <div className="mt-2 space-y-1.5 pb-4">
                  {[
                    ["Maths", "8:00 AM"],
                    ["Science", "9:30 AM"],
                  ].map(([s, t]) => (
                    <div key={s} className="flex items-center justify-between rounded-lg bg-deep-50/70 px-2 py-1.5">
                      <span className="text-[9px] font-medium text-deep-700">{s}</span>
                      <span className="text-[8px] text-deep-400">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-around border-t border-deep-100 px-3 py-2">
                {["Home", "Exams", "More"].map((l, i) => (
                  <span
                    key={l}
                    className={`h-2 w-2 rounded-full ${i === 0 ? "bg-primary-500" : "bg-deep-200"}`}
                    aria-hidden
                  />
                ))}
                <span className="text-[7px] text-deep-400">{""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard frame */}
        <div ref={ref} className="relative mx-auto max-w-5xl">
          <div
            className="transition-transform duration-[900ms] ease-out md:[transform-style:preserve-3d]"
            style={{
              transform: inView
                ? "perspective(2000px) rotateX(0deg) translateY(0)"
                : "perspective(2000px) rotateX(5deg) translateY(28px)",
            }}
          >
            <div className="card-shadow-lg overflow-hidden rounded-2xl border border-deep-100 bg-white">
              {/* Browser bar */}
              <div className="flex items-center gap-3 border-b border-deep-100 bg-deep-50/70 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-deep-100">
                  <svg className="h-3 w-3 text-deep-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0V8m0 0h-4m4 0h4" />
                  </svg>
                  <span className="text-[11px] text-deep-500">app.gyannportal.com/dashboard</span>
                </div>
              </div>

              <div className="flex min-h-[520px]">
                {/* Sidebar */}
                <aside className="hidden w-52 shrink-0 flex-col border-r border-deep-100 bg-white p-4 md:flex">
                  <div className="mb-7 flex items-center gap-2 px-2">
                    <Image
                      src="/logo1.png"
                      alt="GyannPortal logo"
                      width={64}
                      height={32}
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <nav className="flex-1 space-y-1" aria-hidden>
                    {sidebarNav.map((item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium ${
                          i === 0
                            ? "bg-primary-50 text-primary-600"
                            : "text-deep-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-primary-500" : "bg-deep-200"}`} />
                        {item}
                      </div>
                    ))}
                  </nav>
                  <div className="rounded-xl bg-deep-50/70 p-3">
                    <div className="h-1.5 w-3/4 rounded-full bg-deep-200" />
                    <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-deep-200" />
                  </div>
                </aside>

                {/* Main */}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-deep-900">Dashboard</p>
                      <p className="text-[11px] text-deep-400">Welcome back, Ramesh Admin</p>
                    </div>
                    <div className="relative">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-[11px] font-semibold text-white">
                        RA
                      </span>
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
                    </div>
                  </div>

                  {/* Stat row */}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[
                      { label: "Total students", value: "1,248", tone: "text-primary-600", chip: "bg-primary-50" },
                      { label: "Present today", value: "1,175", tone: "text-emerald-600", chip: "bg-emerald-50" },
                      { label: "Fee collected", value: "NPR 24.5L", tone: "text-amber-600", chip: "bg-amber-50" },
                      { label: "Pending fees", value: "NPR 3.2L", tone: "text-rose-600", chip: "bg-rose-50" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-deep-100 bg-white p-3">
                        <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${stat.chip}`}>
                          <span className={`h-2 w-2 rounded-full ${stat.tone.replace("text", "bg")}`} />
                        </div>
                        <p className="text-[10px] text-deep-400">{stat.label}</p>
                        <p className="text-base font-bold tracking-tight text-deep-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {/* Weekly attendance */}
                    <div className="rounded-xl border border-deep-100 bg-white p-4 lg:col-span-2">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-semibold text-deep-800">Weekly attendance</p>
                        <div className="flex items-center gap-3 text-[10px] text-deep-400">
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary-500" />Present</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-deep-200" />Absent</span>
                        </div>
                      </div>
                      <div className="flex items-end gap-2 sm:gap-3">
                        {weekData.map((day, i) => (
                          <div key={i} className="flex flex-1 flex-col gap-1" style={{ height: 108 }}>
                            <div
                              className="w-full rounded-t-sm bg-gradient-to-t from-primary-500 to-accent-400 transition-all duration-700"
                              style={{ height: inView ? `${day.present}%` : "0%", transitionDelay: `${i * 50}ms` }}
                            />
                            <div
                              className="w-full rounded-b-sm bg-deep-100 transition-all duration-700"
                              style={{ height: inView ? `${day.absent}%` : "0%", transitionDelay: `${i * 50}ms` }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                          <span key={d} className="flex-1 text-center text-[10px] text-deep-400">{d}</span>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming exams */}
                    <div className="rounded-xl border border-deep-100 bg-white p-4">
                      <p className="mb-3 text-xs font-semibold text-deep-800">Upcoming exams</p>
                      <div className="space-y-3">
                        {[
                          { name: "Mid-term", grade: "Grade 10 · Sep 25", color: "bg-primary-500" },
                          { name: "Unit test", grade: "Grade 8 · Oct 2", color: "bg-accent-500" },
                          { name: "Pre-board", grade: "Grade 12 · Oct 15", color: "bg-violet-500" },
                        ].map((exam) => (
                          <div key={exam.name} className="flex items-center gap-2.5">
                            <span className={`h-8 w-1 rounded-full ${exam.color}`} />
                            <div>
                              <p className="text-xs font-medium text-deep-800">{exam.name}</p>
                              <p className="text-[10px] text-deep-400">{exam.grade}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Announcements */}
                    <div className="rounded-xl border border-deep-100 bg-white p-4 lg:col-span-2">
                      <p className="mb-2 text-xs font-semibold text-deep-800">Recent announcements</p>
                      <div className="space-y-1">
                        {announcements.map((a) => (
                          <div key={a.text} className="flex items-start gap-2.5 rounded-lg px-1.5 py-1.5">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                            <div>
                              <p className="text-xs text-deep-600">{a.text}</p>
                              <p className="text-[10px] text-deep-400">{a.meta}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="rounded-xl border border-deep-100 bg-white p-4">
                      <p className="mb-2 text-xs font-semibold text-deep-800">September 2026</p>
                      <div className="grid grid-cols-7 gap-0.5">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                          <span key={`h-${i}`} className="py-0.5 text-center text-[9px] font-medium text-deep-400">{d}</span>
                        ))}
                        {[
                          0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                          15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                        ].map((day, i) => (
                          <span
                            key={`d-${i}`}
                            className={`relative rounded-md py-1 text-center text-[9px] ${
                              day === 0
                                ? "invisible"
                                : day === 17
                                ? "font-semibold text-white"
                                : calEvents.has(day)
                                ? "bg-primary-50 font-medium text-primary-600"
                                : "text-deep-600"
                            }`}
                          >
                            {day === 17 && <span className="absolute inset-0 rounded-md bg-gradient-to-br from-primary-500 to-accent-500" />}
                            <span className="relative">{day === 0 ? "" : day}</span>
                          </span>
                        ))}
                      </div>
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
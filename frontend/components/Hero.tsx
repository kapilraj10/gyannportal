"use client";

import Image from "next/image";
import Reveal from "./shared/Reveal";

/* ------------------------------------------------------------------ */
/* Dashboard preview                                                   */
/* ------------------------------------------------------------------ */

const heroStats = [
  { label: "Students", value: "1,248", delta: "+12%", tone: "text-primary-600", ring: "bg-primary-500" },
  { label: "Present today", value: "1,175", delta: "94.2%", tone: "text-accent-600", ring: "bg-accent-500" },
  { label: "Teachers", value: "64", delta: "+3", tone: "text-violet-600", ring: "bg-violet-500" },
  { label: "Fees collected", value: "NPR 2.4M", delta: "89%", tone: "text-amber-600", ring: "bg-amber-500" },
];

const weekBars = [62, 78, 70, 86, 80, 94, 88];

const sidebarItems = [
  { label: "Dashboard", active: true },
  { label: "Students" },
  { label: "Teachers" },
  { label: "Attendance" },
  { label: "Exams" },
  { label: "Reports" },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[580px] lg:ml-auto">
      {/* Radial glow behind the dashboard */}
      <div className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary-400/25 via-accent-300/20 to-violet-300/20 blur-3xl" />
      </div>

      {/* Browser frame */}
      <div className="card-shadow-lg overflow-hidden rounded-2xl border border-deep-100 bg-white">
        {/* Browser bar */}
        <div className="flex items-center gap-3 border-b border-deep-100 bg-deep-50/70 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] text-deep-400 ring-1 ring-deep-100">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0V8m0 0h-4m4 0h4" />
            </svg>
            app.gyannportal.com
          </div>
          <div className="w-6" />
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-40 shrink-0 flex-col gap-0.5 border-r border-deep-100 bg-white p-3 sm:flex">
            <div className="mb-4 flex items-center gap-2 px-2">
              <Image
                src="/logo1.png"
                alt="GyannPortal logo"
                width={64}
                height={32}
                className="h-5 w-auto object-contain"
              />
            </div>
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                  item.active
                    ? "bg-primary-50 text-primary-600"
                    : "text-deep-400"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-primary-500" : "bg-deep-200"}`} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white p-4 sm:p-5">
            {/* Greeting */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-deep-900">Good morning, Ramesh</p>
                <p className="text-[10px] text-deep-400">Here&apos;s what&apos;s happening at Springfield Academy</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-[11px] font-semibold text-white">
                RA
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-deep-100 bg-white p-2.5">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-deep-400">{stat.label}</p>
                  <p className="mt-1 text-sm font-bold tracking-tight text-deep-900">{stat.value}</p>
                  <p className={`mt-0.5 text-[9px] font-semibold ${stat.tone}`}>{stat.delta}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mt-3 rounded-xl border border-deep-100 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-deep-800">Attendance overview</p>
                <span className="text-[9px] text-deep-400">This week</span>
              </div>
              <div className="flex items-end gap-2">
                {weekBars.map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className={`w-full rounded-t-md ${
                        i === weekBars.length - 1
                          ? "bg-gradient-to-t from-primary-500 to-accent-400"
                          : "bg-primary-100"
                      }`}
                      style={{ height: `${h * 0.55}px` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="flex-1 text-center text-[8px] text-deep-400">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="mt-3 rounded-xl border border-deep-100 p-3">
              <p className="mb-2 text-[11px] font-semibold text-deep-800">Recent activity</p>
              <div className="space-y-2">
                {[
                  { text: "Grade 10 exam results published", time: "2m", dot: "bg-emerald-500" },
                  { text: "Fee reminder sent to 23 parents", time: "15m", dot: "bg-primary-500" },
                  { text: "New student enrolled — Grade 8", time: "1h", dot: "bg-violet-500" },
                ].map((activity) => (
                  <div key={activity.text} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${activity.dot}`} />
                    <p className="flex-1 truncate text-[10px] text-deep-600">{activity.text}</p>
                    <span className="shrink-0 text-[8px] text-deep-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: attendance */}
      <div className="absolute -left-3 -top-6 z-10 hidden animate-float-slow items-center gap-3 rounded-xl border border-deep-100 bg-white p-3 shadow-glow sm:flex lg:-left-10">
        <div className="relative flex h-11 w-11 items-center justify-center">
          <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="113"
              strokeDashoffset="10"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-deep-900">96%</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-deep-900">Attendance today</p>
          <p className="text-[10px] text-deep-400">+1.8% vs last week</p>
        </div>
      </div>

      {/* Floating: assignment */}
      <div className="absolute -bottom-5 right-0 z-10 hidden animate-float-delayed items-center gap-2.5 rounded-xl border border-deep-100 bg-white p-3 shadow-glow sm:flex lg:-right-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75v14.25A8.967 8.967 0 0012 18a8.967 8.967 0 006 3.75V3.75A8.967 8.967 0 0012 6.042z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-deep-900">Assignment graded</p>
          <p className="text-[10px] text-deep-400">Math HW · Class 10B</p>
        </div>
      </div>

      {/* Floating: notification */}
      <div className="absolute -right-2 -top-8 z-10 hidden animate-float-slower items-center gap-2 rounded-full border border-white bg-white/80 py-1.5 pl-1.5 pr-3 shadow-glow backdrop-blur sm:flex lg:-right-6">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-[10px] font-medium text-deep-700">Attendance marked</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero({ onRegister }: { onRegister?: () => void }) {
  return (
    <section id="home" className="hero-gradient relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(70%_60%_at_60%_20%,black,transparent)]" />
        <div className="bg-noise absolute inset-0" />
        <div className="absolute -right-32 top-0 h-[30rem] w-[30rem] rounded-full bg-primary-400/15 blur-[110px]" />
        <div className="absolute -left-40 top-1/2 h-[26rem] w-[26rem] rounded-full bg-accent-300/15 blur-[110px]" />
      </div>

      <div className="container-px relative grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_1.18fr] lg:gap-12">
        {/* Left: copy */}
        <div className="max-w-xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-deep-100 bg-white/70 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-deep-700 shadow-sm backdrop-blur">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              Smart School Management Platform
            </span>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 text-base font-medium tracking-wide text-primary-600">
              स्मार्ट विद्यालय, सरल व्यवस्थापन
            </p>
          </Reveal>

          <Reveal delay={150}>
            <h1 className="mt-3 text-[2.75rem] font-bold leading-[1.04] tracking-tight text-deep-900 sm:text-6xl lg:text-[4rem]">
              Smart education,
              <br />
              <span className="gradient-text">simplified management.</span>
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-deep-500">
              GyannPortal brings administrators, teachers, students and parents together in one
              secure, intelligent platform — attendance, exams, fees, results and communication in
              a single place.
            </p>
          </Reveal>

          <Reveal delay={290}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onRegister}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 active:translate-y-0 active:scale-[0.98]"
              >
                Get Started Free
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-deep-200 bg-white/70 px-7 py-3.5 text-base font-semibold text-deep-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-deep-300 hover:bg-white active:translate-y-0"
              >
                Explore Features
              </a>
            </div>
          </Reveal>

          {/* Trust row */}
          <Reveal delay={360}>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex -space-x-2.5">
                {[
                  ["RS", "from-primary-500 to-accent-500"],
                  ["SP", "from-violet-500 to-primary-500"],
                  ["BT", "from-accent-400 to-emerald-500"],
                  ["AM", "from-amber-400 to-orange-500"],
                ].map(([initials, gradient]) => (
                  <span
                    key={initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-semibold text-white ring-2 ring-white`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1 text-sm text-deep-500">
                  Trusted by <span className="font-semibold text-deep-900">50+ schools</span> across Nepal
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right: dashboard */}
        <Reveal delay={200} y={40} className="lg:pl-2">
          <DashboardPreview />
        </Reveal>
      </div>
    </section>
  );
}
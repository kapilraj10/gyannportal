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

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:ml-auto">
      {/* Main Dashboard Card */}
      <div className="bg-white rounded-2xl card-shadow-lg overflow-hidden border border-slate-100">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">G</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">GyannPortal Dashboard</p>
              <p className="text-xs text-slate-400">Springfield Academy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">RA</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
          {[
            { label: "Students", value: "1,248", change: "+12%", color: "bg-blue-50 text-blue-600" },
            { label: "Teachers", value: "64", change: "+3", color: "bg-emerald-50 text-emerald-600" },
            { label: "Attendance", value: "94.2%", change: "+1.8%", color: "bg-violet-50 text-violet-600" },
            { label: "Fees Collected", value: "NPR 2.4M", change: "89%", color: "bg-amber-50 text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-3`}>
              <p className="text-xs opacity-70">{stat.label}</p>
              <p className="text-lg font-bold mt-0.5">{stat.value}</p>
              <p className="text-xs opacity-60 mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="px-4 pb-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Attendance Overview</p>
              <p className="text-xs text-slate-400">This Week</p>
            </div>
            <div className="flex items-end gap-2 h-24">
              {[65, 78, 82, 74, 88, 92, 86].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${h}%`,
                      background: i === 5
                        ? "linear-gradient(180deg, #1e40af, #0d9488)"
                        : "#e2e8f0",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 pb-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</p>
            <div className="space-y-2.5">
              {[
                { text: "Grade 10 exam results published", time: "2m ago", color: "bg-emerald-500" },
                { text: "Fee reminder sent to 23 parents", time: "15m ago", color: "bg-blue-500" },
                { text: "New student enrolled — Grade 8", time: "1h ago", color: "bg-violet-500" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0`} />
                  <p className="text-xs text-slate-600 flex-1">{activity.text}</p>
                  <p className="text-[10px] text-slate-400 shrink-0">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute -top-4 -left-4 sm:-left-8 bg-white rounded-xl card-shadow p-3 animate-float z-10 hidden sm:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Upcoming Exam</p>
          <p className="text-[10px] text-slate-400">Mid-term — Grade 9</p>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 sm:-right-8 bg-white rounded-xl card-shadow p-3 animate-float-delayed z-10 hidden sm:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Fee Collection</p>
          <p className="text-[10px] text-slate-400">NPR 145,000 today</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const headingRef = useInView(0.2);
  const contentRef = useInView(0.2);

  return (
    <section id="home" className="relative hero-gradient pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-200/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div ref={headingRef} className="opacity-0 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-soft" />
              <span className="text-xs font-medium text-primary-600">School Management Simplified</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-slate-900 mb-4">
              स्मार्ट विद्यालय,
              <br />
              <span className="gradient-text">सरल व्यवस्थापन।</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-3 leading-relaxed max-w-xl">
              Manage your entire school from one powerful platform.
            </p>

            <p className="text-base text-slate-500 mb-8 leading-relaxed max-w-xl">
              GyannPortal brings administrators, teachers, students, and parents together in one secure and intelligent school management platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href="#"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.97]"
              >
                Get Started Free
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Explore Features
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                No complicated setup
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Easy to use
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Built for modern schools
              </span>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div ref={contentRef} className="opacity-0 lg:pl-4">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

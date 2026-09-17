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

const problems = [
  "Too much paperwork",
  "Scattered student records",
  "Manual attendance tracking",
  "Difficult fee tracking",
  "Communication gaps between school and parents",
  "Time-consuming report generation",
];

const solutions = [
  "Digital-first workflows — zero paper",
  "Centralized, secure student database",
  "Real-time attendance with reports",
  "Automated fee tracking & invoices",
  "Instant announcements & notifications",
  "One-click reports & analytics",
];

export default function ProblemSolution() {
  const ref = useInView(0.1);

  return (
    <section id="about" className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16 opacity-0">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Everything your school needs.
            <br />
            <span className="gradient-text">One platform.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            School management shouldn&apos;t be this hard. GyannPortal replaces
            scattered tools and manual processes with one integrated system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Before - Problems */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Without GyannPortal</h3>
            </div>
            <div className="space-y-3">
              {problems.map((problem, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-red-100 card-shadow"
                >
                  <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm text-slate-600">{problem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After - Solutions */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">With GyannPortal</h3>
            </div>
            <div className="space-y-3">
              {solutions.map((solution, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-emerald-100 card-shadow"
                >
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-600">{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

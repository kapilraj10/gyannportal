"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

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

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* Phone frame */}
      <div className="relative bg-slate-900 rounded-[3rem] p-3 card-shadow-lg">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-10" />
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full z-20" />

        {/* Screen */}
        <div className="bg-white rounded-[2.25rem] overflow-hidden min-h-[500px]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-8 pb-2">
            <span className="text-[10px] font-semibold text-slate-800">9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
              <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logo1.png"
                alt="GyannPortal logo"
                width={1536}
                height={1024}
                className="h-6 w-auto object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-400">Welcome back, Aarav</p>
          </div>

          {/* Quick stats */}
          <div className="px-5 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-xl p-2.5">
                <p className="text-[9px] text-blue-500">Attendance</p>
                <p className="text-sm font-bold text-blue-700">94%</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5">
                <p className="text-[9px] text-emerald-500">Grade Average</p>
                <p className="text-sm font-bold text-emerald-700">A-</p>
              </div>
            </div>
          </div>

          {/* Today's schedule */}
          <div className="px-5 mb-3">
            <p className="text-[10px] font-semibold text-slate-700 mb-2">Today&apos;s Classes</p>
            <div className="space-y-1.5">
              {[
                { time: "8:00 AM", subject: "Mathematics", teacher: "Mr. Sharma" },
                { time: "9:30 AM", subject: "Science", teacher: "Mrs. Poudel" },
                { time: "11:00 AM", subject: "English", teacher: "Mr. Thapa" },
              ].map((cls) => (
                <div key={cls.time} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <div className="w-1 h-6 rounded-full bg-primary-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-slate-700">{cls.subject}</p>
                    <p className="text-[9px] text-slate-400">{cls.time} &middot; {cls.teacher}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="px-5 mb-4">
            <p className="text-[10px] font-semibold text-slate-700 mb-2">Pending Assignments</p>
            <div className="space-y-1.5">
              {[
                { name: "Math HW Ch.5", due: "Due tomorrow" },
                { name: "Science Lab Report", due: "Due in 3 days" },
              ].map((a) => (
                <div key={a.name} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                  <p className="text-[10px] font-medium text-slate-700">{a.name}</p>
                  <span className="text-[9px] text-amber-600">{a.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around px-4 py-3 bg-white border-t border-slate-100">
            {["Home", "Classes", "Results", "More"].map((label) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className={`w-5 h-5 rounded-md ${label === "Home" ? "bg-primary-500" : "bg-slate-200"}`} />
                <span className={`text-[8px] ${label === "Home" ? "text-primary-500 font-medium" : "text-slate-400"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -right-6 top-16 bg-white rounded-xl card-shadow p-3 animate-float hidden sm:block">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-800">New Notice</p>
            <p className="text-[9px] text-slate-400">PTM on Friday</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileApp() {
  const ref = useInView(0.1);

  return (
    <section className="section-padding bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div ref={ref} className="opacity-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
              <span className="text-xs font-medium text-primary-600">Mobile App</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Your school,
              <br />
              <span className="gradient-text">in your pocket.</span>
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Students, teachers, parents, and administrators can stay connected
              wherever they are. Our mobile app keeps everyone in the loop.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: "Push Notifications", icon: "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" },
                { label: "Attendance", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
                { label: "Results", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5" },
                { label: "Assignments", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292" },
                { label: "Fees", icon: "M12 6v12m-3-2.818" },
                { label: "Announcements", icon: "M10.34 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94" },
                { label: "Timetable", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-100 card-shadow">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{f.label}</span>
                </div>
              ))}
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-3 px-6 py-3.5 text-base font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.97]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 2.237l-3.523-2.237-4 4-4-4-3.523 2.237c-.51.324-.8.9-.8 1.526v14.474c0 .626.29 1.202.8 1.526l3.523 2.237 4-4 4 4 3.523-2.237c.51-.324.8-.9.8-1.526V3.763c0-.626-.29-1.202-.8-1.526zM12 18l-4-4h3V6h2v8h3l-4 4z" />
              </svg>
              Download the App
            </a>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

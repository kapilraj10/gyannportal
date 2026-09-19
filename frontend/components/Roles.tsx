"use client";

import { useState } from "react";
import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

type RoleKey = "admin" | "teacher" | "student" | "parent";

interface Role {
  key: RoleKey;
  tab: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

const roles: Role[] = [
  {
    key: "admin",
    tab: "Administrators",
    title: "School Admin",
    description: "Complete control over school operations, finance and analytics.",
    icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342",
    features: [
      "School-wide analytics dashboard",
      "Teacher & staff management",
      "Fee collection oversight",
      "Report generation",
      "System configuration",
    ],
  },
  {
    key: "teacher",
    tab: "Teachers",
    title: "Teachers",
    description: "Manage classes, attendance, assignments, exams and students.",
    icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387",
    features: [
      "Class & student overview",
      "Take attendance in seconds",
      "Create & grade assignments",
      "Manage exam results",
      "Send notices to students",
    ],
  },
  {
    key: "student",
    tab: "Students",
    title: "Students",
    description: "Access classes, assignments, exams, results and announcements.",
    icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347",
    features: [
      "View timetable & schedules",
      "Submit assignments online",
      "Check exam results",
      "View attendance record",
      "Read announcements",
    ],
  },
  {
    key: "parent",
    tab: "Parents",
    title: "Parents",
    description: "Monitor attendance, academic performance, fees, notices and activities.",
    icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719",
    features: [
      "Real-time attendance alerts",
      "View report cards",
      "Pay fees online",
      "Receive school notices",
      "Track academic progress",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Role preview panels                                                 */
/* ------------------------------------------------------------------ */

function AdminPreview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Students", value: "1,248", tone: "text-primary-600" },
          { label: "Attendance", value: "94.2%", tone: "text-accent-600" },
          { label: "Fees · Oct", value: "NPR 2.4M", tone: "text-violet-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-deep-100 bg-white p-3">
            <p className="text-[10px] text-deep-400">{kpi.label}</p>
            <p className={`mt-1 text-lg font-bold ${kpi.tone}`}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-deep-800">School-wide performance</p>
        <div className="flex items-end gap-1.5">
          {[40, 62, 50, 74, 58, 86, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-500/80 to-accent-400" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-deep-800">Mark attendance · Class 10A</p>
        <div className="space-y-2">
          {[
            ["Aarav Gurung", "Present", "bg-emerald-100 text-emerald-600"],
            ["Sneha Karki", "Present", "bg-emerald-100 text-emerald-600"],
            ["Yash Thapa", "Absent", "bg-rose-100 text-rose-600"],
          ].map(([name, status, tone]) => (
            <div key={name} className="flex items-center justify-between rounded-lg bg-deep-50/60 px-3 py-2">
              <span className="flex items-center gap-2 text-xs font-medium text-deep-800">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                {name}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-2 text-xs font-semibold text-deep-800">Next class</p>
        <p className="text-sm font-bold text-deep-900">Science · Grade 8</p>
        <p className="text-[11px] text-deep-400">9:30 AM · Room 12</p>
      </div>
    </div>
  );
}

function StudentPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-2 text-xs font-semibold text-deep-800">Weekly timetable</p>
        {[
          ["Mon", "Science", "08:00"],
          ["Tue", "English", "09:30"],
          ["Wed", "Maths", "11:00"],
        ].map(([day, subject, time]) => (
          <div key={day} className="flex items-center justify-between border-b border-deep-50 py-2 last:border-0">
            <span className="text-xs font-medium text-deep-500">{day}</span>
            <span className="text-xs font-semibold text-deep-900">{subject}</span>
            <span className="text-[10px] text-deep-400">{time}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-2 text-xs font-semibold text-deep-800">Latest results</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {["Maths A", "Science B+", "English A-"].map((g) => (
              <p key={g} className="text-xs text-deep-500">{g}</p>
            ))}
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg font-bold text-white">
            87%
          </span>
        </div>
      </div>
    </div>
  );
}

function ParentPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-deep-800">Aarav&apos;s week</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg bg-emerald-50 p-2.5">
            <p className="text-[10px] text-emerald-600">Attendance</p>
            <p className="text-base font-bold text-emerald-700">96%</p>
          </div>
          <div className="rounded-lg bg-accent-50 p-2.5">
            <p className="text-[10px] text-accent-600">Grade avg</p>
            <p className="text-base font-bold text-accent-700">A-</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-deep-100 bg-white p-4">
        <p className="mb-2 text-xs font-semibold text-deep-800">Recent notices</p>
        {[
          ["PTM on Friday · 10 AM", "2h ago"],
          ["Fee due · Dec 5", "1d ago"],
        ].map(([text, time]) => (
          <div key={text} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-xs text-deep-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {text}
            </span>
            <span className="text-[10px] text-deep-400">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolePreview({ role }: { role: Role }) {
  return (
    <div key={role.key} className="animate-fade-up">
      {role.key === "admin" && <AdminPreview />}
      {role.key === "teacher" && <TeacherPreview />}
      {role.key === "student" && <StudentPreview />}
      {role.key === "parent" && <ParentPreview />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Roles() {
  const [active, setActive] = useState<RoleKey>("admin");
  const role = roles.find((r) => r.key === active)!;

  return (
    <section id="solutions" className="surface-gradient relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <div className="container-px relative max-w-7xl">
        <SectionHeading
          badge="Solutions"
          title={
            <>
              One platform.
              <br />
              <span className="gradient-text">Every role connected.</span>
            </>
          }
          subtitle="Whether you run the school, teach in the classroom or support from home — GyannPortal is built for you."
        />

        {/* Tabs */}
        <Reveal delay={100}>
          <div
            className="mx-auto mb-12 flex max-w-2xl flex-wrap justify-center gap-1 rounded-2xl border border-deep-100 bg-white/70 p-1.5 shadow-sm backdrop-blur"
            role="tablist"
            aria-label="Choose your role"
          >
            {roles.map((r) => (
              <button
                key={r.key}
                role="tab"
                aria-selected={active === r.key}
                onClick={() => setActive(r.key)}
                className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  active === r.key
                    ? "bg-deep-900 text-white shadow-sm"
                    : "text-deep-500 hover:bg-deep-100/70 hover:text-deep-800"
                }`}
              >
                {r.tab}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Benefits */}
          <div key={`copy-${role.key}`} role="tabpanel" className="animate-fade-up">
            <Reveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-sm">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={role.icon} />
                  </svg>
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-deep-900">{role.title}</h3>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <p className="mb-6 text-lg leading-relaxed text-deep-500">{role.description}</p>
            </Reveal>
            <ul className="space-y-3.5">
              {role.features.map((feature, i) => (
                <Reveal key={feature} delay={100 + i * 60} y={14}>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-base text-deep-700">{feature}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Preview panel */}
          <Reveal delay={200} y={32}>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 -z-10">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary-200/30 to-accent-200/30 blur-2xl" />
              </div>
              <div className="card-shadow-lg overflow-hidden rounded-2xl border border-deep-100 bg-white">
                <div className="flex items-center justify-between border-b border-deep-100 bg-deep-50/60 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="rounded-full bg-white px-3 py-0.5 text-[10px] font-medium text-deep-400 ring-1 ring-deep-100">
                    {role.tab} workspace
                  </span>
                </div>
                <div className="p-5">
                  <RolePreview role={role} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
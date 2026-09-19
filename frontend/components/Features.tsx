import type { ReactNode } from "react";
import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

/* ------------------------------------------------------------------ */
/* Small pure-visual pieces                                             */
/* ------------------------------------------------------------------ */

function MiniBarChart() {
  return (
    <div className="flex items-end gap-1.5">
      {[42, 65, 50, 78, 60, 90, 72].map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm ${
            i === 5 ? "bg-gradient-to-t from-primary-500 to-accent-400" : "bg-deep-100"
          }`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function AttendanceRing() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="27" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="27"
            fill="none"
            stroke="#2563eb"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="169.6"
            strokeDashoffset="13"
          />
        </svg>
        <span className="absolute text-sm font-bold text-deep-900">92%</span>
      </div>
      <div className="space-y-1.5">
        {[
          ["Present", "1,150", "bg-primary-500"],
          ["Absent", "98", "bg-deep-200"],
        ].map(([label, count, dot]) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <span className="text-xs text-deep-500">{label}</span>
            <span className="text-xs font-semibold text-deep-900">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const students = [
  { name: "Aarav Gurung", cls: "10A", status: "Enrolled" },
  { name: "Sneha Karki", cls: "10A", status: "Enrolled" },
  { name: "Yash Thapa", cls: "9B", status: "Pending" },
];

const assignments = [
  { name: "Math — Ch. 5", status: "29 more", tone: "text-deep-400" },
  { name: "Science lab report", status: "Graded", tone: "text-emerald-500" },
];

const exams = [
  { name: "Mid-term", grade: "A", cls: "Grade 10", accent: "bg-primary-500" },
  { name: "Unit test", grade: "B+", cls: "Grade 8", accent: "bg-accent-500" },
];

/* ------------------------------------------------------------------ */
/* Card shell                                                          */
/* ------------------------------------------------------------------ */

function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} y={24} className={`h-full ${className}`}>
      <div className="card-hover group flex h-full flex-col rounded-2xl border border-deep-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-primary-100 hover:shadow-[0_20px_50px_-24px_rgba(37,99,235,0.22)]">
        {children}
      </div>
    </Reveal>
  );
}

function Icon({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Features() {
  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="container-px max-w-7xl">
        <SectionHeading
          badge="Features"
          title={
            <>
              Powerful tools for
              <br />
              <span className="gradient-text">every corner of your school.</span>
            </>
          }
          subtitle="From the daily roll call to end-of-term reports — GyannPortal has covered."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {/* Smart Dashboard — large */}
          <Card className="lg:col-span-2 lg:row-span-2" delay={0}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Icon className="bg-primary-50 text-primary-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.083 1.186-.19l.716-.57c.51-.41 1.258-.357 1.705.105l.763.763c.448.448.5 1.196.105 1.705l-.57.716c-.274.342-.276.784-.19 1.186s.506.71.93.78l.894.15c.542.09.94.56.94 1.109v1.094c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.93.78s-.083.844.19 1.186l.57.716c.41.51.357 1.258-.105 1.705l-.763.763c-.448.448-1.196.5-1.705.105l-.716-.57c-.342-.274-.784-.276-1.186-.19s-.71.506-.78.93l-.15.894c-.09.542-.56.94-1.109.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93s-.844-.083-1.185.19l-.716.57c-.51.41-1.258.357-1.705-.105l-.763-.763c-.448-.448-.5-1.196-.105-1.705l.57-.716c.274-.342.276-.784.19-1.186s-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.148c.424-.071.764-.384.93-.781s.083-.844-.19-1.185l-.57-.716c-.41-.51-.357-1.258.105-1.705l.763-.763c.448-.448 1.196-.5 1.705-.105l.716.57c.342.274.784.276 1.186.19s.71-.506.78-.93l.15-.894Z" />
                  </svg>
                </Icon>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-deep-900">
                  Smart Dashboard
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-deep-500">
                  Every metric that matters — attendance, fees, exams, enrollment — on one
                  actionable screen. Get real-time insights through interactive dashboards and
                  detailed reports.
                </p>
              </div>
              <span className="hidden rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600 sm:inline-flex">
                Live
              </span>
            </div>

            <div className="mt-6 grid flex-1 grid-cols-2 gap-3">
              <div className="rounded-xl border border-deep-100 bg-deep-50/40 p-3">
                <p className="text-[11px] font-medium text-deep-400">Fees collected · Oct</p>
                <p className="mt-1 text-lg font-bold text-deep-900">NPR 2.4M</p>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-500">+12.5%</p>
              </div>
              <div className="rounded-xl border border-deep-100 bg-deep-50/40 p-3">
                <p className="text-[11px] font-medium text-deep-400">Exam pass rate</p>
                <p className="mt-1 text-lg font-bold text-deep-900">91.4%</p>
                <p className="mt-0.5 text-[11px] font-semibold text-primary-600">+2.1pt</p>
              </div>
              <div className="col-span-2 rounded-xl border border-deep-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-deep-800">Enrollment trend</p>
                  <span className="text-[10px] text-deep-400">Classes 1–12</span>
                </div>
                <MiniBarChart />
              </div>
            </div>
          </Card>

          {/* Student Management */}
          <Card delay={80}>
            <Icon className="bg-violet-50 text-violet-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </Icon>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Student Management</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Complete profiles, enrollment, academic records and documents.
            </p>
            <div className="mt-5 space-y-2">
              {students.map((s) => (
                <div key={s.name} className="flex items-center gap-2.5 rounded-lg border border-deep-100 px-2.5 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-[10px] font-semibold text-white">
                    {s.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-deep-800">{s.name}</p>
                    <p className="text-[10px] text-deep-400">{s.cls}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      s.status === "Enrolled" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Attendance */}
          <Card delay={140}>
            <Icon className="bg-accent-50 text-accent-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </Icon>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Attendance</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Real-time tracking with automatic parent notifications.
            </p>
            <div className="mt-5 rounded-xl border border-deep-100 bg-white p-4">
              <AttendanceRing />
            </div>
          </Card>

          {/* Analytics & Reports — large */}
          <Card className="lg:col-span-2" delay={100}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Icon className="bg-amber-50 text-amber-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </Icon>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Analytics & Reports</h3>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-deep-500">
                  One-click report cards, financial summaries and performance trends — accountability
                  without the spreadsheet grind.
                </p>
              </div>
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 sm:inline-flex">
                Export CSV · PDF
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Avg. attendance", value: "94.2%", tone: "text-primary-600" },
                { label: "Fee collection", value: "89%", tone: "text-accent-600" },
                { label: "Exam pass rate", value: "91.4%", tone: "text-violet-600" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-deep-100 bg-deep-50/40 px-4 py-3">
                  <p className="text-[11px] font-medium text-deep-400">{kpi.label}</p>
                  <p className={`mt-1 text-lg font-bold ${kpi.tone}`}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Assignments */}
          <Card delay={180}>
            <Icon className="bg-primary-50 text-primary-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </Icon>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Assignments</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Create, distribute and grade work without the paper trail.
            </p>
            <div className="mt-5 space-y-2">
              {assignments.map((a) => (
                <div key={a.name} className="flex items-center gap-2.5 rounded-lg border border-deep-100 px-2.5 py-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-deep-300 bg-white">
                    <svg className="h-2.5 w-2.5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="flex-1 text-xs font-medium text-deep-800">{a.name}</p>
                  <span className={`text-[10px] font-medium ${a.tone}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Exams */}
          <Card delay={120}>
            <Icon className="bg-rose-50 text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </Icon>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Exams & Results</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Marks, grading, report cards — published in one click.
            </p>
            <div className="mt-5 space-y-2">
              {exams.map((e) => (
                <div key={e.name} className="flex items-center gap-2.5 rounded-lg border border-deep-100 px-2.5 py-2">
                  <span className={`h-8 w-1 rounded-full ${e.accent}`} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-deep-800">{e.name}</p>
                    <p className="text-[10px] text-deep-400">{e.cls}</p>
                  </div>
                  <span className="text-sm font-bold text-deep-900">{e.grade}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card delay={160}>
            <Icon className="bg-cyan-50 text-cyan-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </Icon>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Notifications</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Attendance, fees and results — pushed to the right person instantly.
            </p>
          </Card>

          {/* Communication */}
          <Card delay={200}>
            <Icon className="bg-pink-50 text-pink-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </Icon>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-deep-900">Communication</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Announcements and alerts to students, teachers and parents — all in one place.
            </p>
          </Card>
        </div>

        {/* Remaining modules */}
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-dashed border-deep-200 bg-deep-50/40 px-6 py-5">
            {["Teacher Management", "Fees & Payments", "Timetable", "Library"].map((label) => (
              <span key={label} className="flex items-center gap-2 text-sm font-medium text-deep-600">
                <svg className="h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {label}
              </span>
            ))}
            <span className="text-sm font-medium text-deep-400">and more…</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
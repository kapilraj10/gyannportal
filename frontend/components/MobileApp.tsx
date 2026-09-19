import Image from "next/image";
import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

const appFeatures = [
  { label: "Push notifications", icon: "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" },
  { label: "Attendance", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Assignments", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75v14.25A8.967 8.967 0 0 0 12 18a8.967 8.967 0 0 0 6 3.75V3.75A8.967 8.967 0 0 0 12 6.042z" },
  { label: "Results & grades", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" },
  { label: "Fees & payments", icon: "M12 6v12m-3-2.818.879.659 1.171-1.671.879.659-1.17 1.671.879.659-1.171 1.671M12 6c1.162 0 2.317.14 3.428.403" },
  { label: "Timetable", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[264px] sm:w-[288px]">
      <div className="animate-float-slow">
        {/* Phone frame */}
        <div className="relative rounded-[2.9rem] border border-deep-200 bg-gradient-to-b from-deep-800 to-deep-900 p-[10px] shadow-[0_40px_90px_-30px_rgba(15,23,42,0.55)]">
          <div className="absolute left-1/2 top-2.5 z-20 h-[18px] w-[90px] -translate-x-1/2 rounded-full bg-deep-800" />
          <div className="overflow-hidden rounded-[2.3rem] bg-white">
            {/* Status */}
            <div className="flex items-center justify-between px-6 pb-1 pt-9">
              <span className="text-[10px] font-semibold text-deep-900">9:41</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-deep-400" />
                <span className="h-3 w-2 rounded-sm bg-deep-400" />
              </span>
            </div>

            {/* App header */}
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between">
                <Image
                  src="/logo1.png"
                  alt="GyannPortal logo"
                  width={80}
                  height={40}
                  className="h-6 w-auto object-contain"
                />
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-[10px] text-deep-400">Welcome back, Aarav</p>
              <p className="text-sm font-bold tracking-tight text-deep-900">Today&apos;s classes</p>
            </div>

            {/* Quick stats */}
            <div className="px-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-2.5">
                  <p className="text-[9px] text-primary-100">Attendance</p>
                  <p className="text-base font-bold text-white">94%</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-accent-500 to-emerald-500 p-2.5">
                  <p className="text-[9px] text-white/80">Grade average</p>
                  <p className="text-base font-bold text-white">A-</p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="px-5 py-3">
              <div className="space-y-1.5">
                {[
                  { time: "8:00 AM", subject: "Mathematics", teacher: "Mr. Sharma" },
                  { time: "9:30 AM", subject: "Science", teacher: "Mrs. Poudel" },
                  { time: "11:00 AM", subject: "English", teacher: "Mr. Thapa" },
                ].map((cls) => (
                  <div key={cls.time} className="flex items-center gap-2 rounded-lg border border-deep-100 bg-white p-2">
                    <span className="h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary-500 to-accent-400" />
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-deep-800">{cls.subject}</p>
                      <p className="text-[9px] text-deep-400">{cls.time} · {cls.teacher}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment card */}
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 p-2.5">
                <div>
                  <p className="text-[10px] font-semibold text-deep-800">Science Lab Report</p>
                  <p className="text-[9px] text-amber-600">Due in 3 days</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-amber-600 ring-1 ring-amber-200">
                  Pending
                </span>
              </div>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-around border-t border-deep-100 bg-white px-6 py-3">
              {["Home", "Classes", "Results"].map((label, i) => (
                <span key={label} className="flex flex-col items-center gap-1">
                  <span className={`h-3 w-3 rounded-full ${i === 0 ? "bg-gradient-to-br from-primary-500 to-accent-500" : "bg-deep-200"}`} />
                  <span className={`text-[7px] ${i === 0 ? "font-semibold text-primary-500" : "text-deep-400"}`}>{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating: notification */}
      <div className="absolute -left-16 top-24 z-10 hidden animate-float-delayed rounded-xl border border-deep-100 bg-white p-3 shadow-glow sm:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-deep-900">New notice</p>
            <p className="text-[10px] text-deep-400">PTM on Friday · 10 AM</p>
          </div>
        </div>
      </div>

      {/* Floating: progress */}
      <div className="absolute -right-12 bottom-28 z-10 hidden animate-float-slower rounded-xl border border-deep-100 bg-white p-3 shadow-glow sm:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-deep-900">Term progress</p>
            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-deep-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary-500 to-accent-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileApp() {
  return (
    <section className="surface-gradient relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-noise" />
      <div className="container-px relative grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <Reveal>
            <div className="relative">
              <span className="pointer-events-none absolute -left-5 -top-6 select-none text-6xl font-bold leading-none text-accent-200/60" aria-hidden>
                “
              </span>
              <SectionHeading
                badge="Mobile app"
                align="left"
                title={
                  <>
                    Learning doesn&apos;t stop
                    <br />
                    <span className="gradient-text">at the classroom.</span>
                  </>
                }
                subtitle="Students, teachers, parents and administrators stay connected from anywhere — with mobile learning, notifications, assignments, progress and attendance in their pocket."
              />
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {appFeatures.map((f, i) => (
              <Reveal key={f.label} delay={i * 60} y={14}>
                <div className="flex items-center gap-2.5 rounded-xl border border-deep-100 bg-white/80 p-3 backdrop-blur transition-colors duration-300 hover:border-primary-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </span>
                  <span className="text-xs font-medium text-deep-800 sm:text-sm">{f.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-deep-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-deep-800 hover:shadow-lg active:translate-y-0"
              >
                <svg className="h-5 w-5 text-accent-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 2.237l-3.523-2.237-4 4-4-4-3.523 2.237c-.51.324-.8.9-.8 1.526v14.474c0 .626.29 1.202.8 1.526l3.523 2.237 4-4 4 4 3.523-2.237c.51-.324.8-.9.8-1.526V3.763c0-.626-.29-1.202-.8-1.526zM12 18l-4-4h3V6h2v8h3l-4 4z" />
                </svg>
                Download the App
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-xl border border-deep-200 bg-white/70 px-6 py-3.5 text-base font-semibold text-deep-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-deep-300 hover:bg-white"
              >
                iOS & Android
              </a>
            </div>
          </Reveal>
        </div>

        {/* Phone */}
        <div className="order-1 lg:order-2">
          <Reveal delay={120} y={36}>
            <PhoneMockup />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
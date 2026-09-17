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

const roles = [
  {
    title: "School Admin",
    description: "Complete control over school operations.",
    color: "from-primary-500 to-primary-600",
    bgColor: "bg-primary-50",
    textColor: "text-primary-600",
    borderColor: "border-primary-100",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.083 1.186-.19l.716-.57c.51-.41 1.258-.357 1.705.105l.763.763c.448.448.5 1.196.105 1.705l-.57.716c-.274.342-.276.784-.19 1.186s.506.71.93.78l.894.15c.542.09.94.56.94 1.109v1.094c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.93.78s-.083.844.19 1.186l.57.716c.41.51.357 1.258-.105 1.705l-.763.763c-.448.448-1.196.5-1.705.105l-.716-.57c-.342-.274-.784-.276-1.186-.19s-.71.506-.78.93l-.15.894c-.09.542-.56.94-1.109.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93s-.844-.083-1.185.19l-.716.57c-.51.41-1.258.357-1.705-.105l-.763-.763c-.448-.448-.5-1.196-.105-1.705l.57-.716c.274-.342.276-.784.19-1.186s-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.148c.424-.071.764-.384.93-.781s.083-.844-.19-1.185l-.57-.716c-.41-.51-.357-1.258.105-1.705l.763-.763c.448-.448 1.196-.5 1.705-.105l.716.57c.342.274.784.276 1.186.19s.71-.506.78-.93l.15-.894Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    features: [
      "School-wide analytics dashboard",
      "Teacher & staff management",
      "Fee collection oversight",
      "Report generation",
      "System configuration",
    ],
  },
  {
    title: "Teacher",
    description: "Manage classes, attendance, assignments, exams, and students.",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
      </svg>
    ),
    features: [
      "Class & student overview",
      "Take attendance in seconds",
      "Create & grade assignments",
      "Manage exam results",
      "Send notices to students",
    ],
  },
  {
    title: "Student",
    description: "Access classes, assignments, exams, results, and announcements.",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-100",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    features: [
      "View timetable & schedules",
      "Submit assignments online",
      "Check exam results",
      "View attendance record",
      "Read announcements",
    ],
  },
  {
    title: "Parent",
    description: "Monitor attendance, academic performance, fees, notices, and activities.",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-100",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    features: [
      "Real-time attendance alerts",
      "View report cards",
      "Pay fees online",
      "Receive school notices",
      "Track academic progress",
    ],
  },
];

function RoleCard({ role }: { role: typeof roles[0] }) {
  return (
    <div className={`group relative p-6 rounded-2xl border ${role.borderColor} bg-white hover:${role.bgColor} card-shadow hover:card-shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className={`w-12 h-12 rounded-xl ${role.bgColor} flex items-center justify-center ${role.textColor} mb-5 group-hover:scale-110 transition-transform`}>
        {role.icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{role.title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">{role.description}</p>
      <ul className="space-y-2.5">
        {role.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <svg className={`w-4 h-4 ${role.textColor} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Roles() {
  const headerRef = useInView(0.15);

  return (
    <section id="roles" className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center mb-16 opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
            <span className="text-xs font-medium text-primary-600">For Everyone</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            One platform.
            <br />
            <span className="gradient-text">Every role connected.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Whether you run the school, teach in a classroom, study for exams, or
            support from home — GyannPortal has you covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {roles.map((role) => (
            <RoleCard key={role.title} role={role} />
          ))}
        </div>
      </div>
    </section>
  );
}

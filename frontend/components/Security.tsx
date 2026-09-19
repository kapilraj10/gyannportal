import Reveal from "./shared/Reveal";

const securityFeatures = [
  {
    title: "Secure Authentication",
    description: "Multi-factor authentication and secure login protocols protect every account.",
    icon: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
  },
  {
    title: "Role-Based Access",
    description: "Each user only sees what they need — admins, teachers, students and parents have tailored permissions.",
    icon: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
  },
  {
    title: "Data Privacy",
    description: "Your school data is encrypted at rest and in transit — never shared with third parties.",
    icon: "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z",
  },
  {
    title: "Encrypted Communication",
    description: "All data transmitted between devices and our servers is fully encrypted.",
    icon: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
  },
  {
    title: "Regular Backups",
    description: "Automatic daily backups ensure your school data is always safe and recoverable.",
    icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182",
  },
  {
    title: "Audit Logs",
    description: "Complete activity logs track who did what and when — full accountability.",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12",
  },
  {
    title: "Secure API Architecture",
    description: "Industry-standard API security with rate limiting, token authentication and input validation.",
    icon: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63",
  },
];

export default function Security() {
  return (
    <section className="relative overflow-hidden bg-deep-900 py-20 md:py-28">
      {/* Textures */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary-500/15 blur-[100px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="container-px relative max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-300 backdrop-blur">
              Security
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Your school&apos;s data
              <br />
              <span className="bg-gradient-to-r from-accent-300 to-primary-300 bg-clip-text text-transparent">
                deserves protection.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-5 text-lg leading-relaxed text-deep-300">
              Built with enterprise-grade security to keep your school&apos;s sensitive data safe
              and private.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60} y={20} className="h-full">
              <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-accent-300 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-deep-300">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
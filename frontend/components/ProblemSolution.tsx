import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

const pairs = [
  {
    problem: "Bound by paperwork — registers, files and manual records",
    solution: "Digital-first workflows — zero paper, everything online",
  },
  {
    problem: "Data scattered across spreadsheets, apps and memory",
    solution: "One centralized, secure student database",
  },
  {
    problem: "Slow, error-prone attendance, fees and report generation",
    solution: "Real-time attendance, automated fees, one-click reports",
  },
  {
    problem: "Parents left disconnected from their child's progress",
    solution: "Instant notifications and live progress for every parent",
  },
];

export default function ProblemSolution() {
  return (
    <section id="about" className="surface-gradient relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <div className="container-px relative max-w-7xl">
        <SectionHeading
          badge="Why GyannPortal"
          title={
            <>
              Traditional school management
              <br />
              <span className="gradient-text">was never this simple.</span>
            </>
          }
          subtitle="Four everyday pain points. One intelligent platform that replaces them all."
        />

        <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:gap-6">
          {pairs.map((pair, index) => (
            <div
              key={pair.problem}
              className="grid items-center gap-8 rounded-2xl lg:grid-cols-[1fr_64px_1fr] lg:gap-6"
            >
              {/* Problem */}
              <Reveal delay={index * 60} y={18}>
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-deep-200 bg-white text-deep-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <p className="text-base font-medium leading-relaxed text-deep-500 sm:text-lg">
                    {pair.problem}
                  </p>
                </div>
              </Reveal>

              {/* Connector */}
              <div className="hidden lg:block">
                <Reveal delay={index * 60 + 40}>
                  <div className="relative flex items-center justify-center">
                    <span className="h-px w-full bg-gradient-to-r from-deep-300 via-primary-300 to-accent-300" />
                    <span className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-deep-100 bg-white shadow-sm">
                      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 4l8 8-8 8m8-8H3" />
                      </svg>
                    </span>
                  </div>
                </Reveal>
              </div>

              {/* Solution */}
              <Reveal delay={index * 60 + 40} y={18}>
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-sm">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-base font-semibold leading-relaxed text-deep-900 sm:text-lg">
                    {pair.solution}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
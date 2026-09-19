import Reveal from "./shared/Reveal";

export default function CTA({ onRegister }: { onRegister?: () => void }) {
  return (
    <section id="contact" className="bg-white pb-20 pt-4 md:pb-28 md:pt-8">
      <div className="container-px max-w-7xl">
        <Reveal y={32}>
          <div className="relative overflow-hidden rounded-[2rem] bg-deep-900 px-6 py-16 text-center shadow-[0_40px_90px_-40px_rgba(15,23,42,0.6)] sm:px-16 sm:py-20">
            {/* Abstract background */}
            <div className="pointer-events-none absolute inset-0">
              <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)]" />
              <div className="bg-noise absolute inset-0" />
              <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-primary-500/25 blur-[90px]" />
              <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-accent-500/20 blur-[100px]" />
              <div className="absolute left-1/2 top-0 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
              <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
            </div>

            <div className="relative mx-auto max-w-2xl">
              <Reveal delay={60}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-300 backdrop-blur">
                  Get started today
                </span>
              </Reveal>
              <Reveal delay={140}>
                <h2 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                  Build a smarter
                  <br />
                  <span className="bg-gradient-to-r from-accent-300 via-primary-300 to-violet-300 bg-clip-text text-transparent">
                    learning experience.
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={220}>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-deep-300">
                  Everything your institution needs to manage learning, students and performance — in
                  one platform.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    onClick={onRegister}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-deep-900 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-50 active:translate-y-0"
                  >
                    Get Started
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
                    href="#showcase"
                    className="inline-flex items-center justify-center rounded-xl border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5 active:translate-y-0"
                  >
                    Book a Demo
                  </a>
                </div>
              </Reveal>
              <Reveal delay={360}>
                <p className="mt-7 text-xs text-deep-400">
                  No credit card required · Free onboarding · Most schools live within 48 hours
                </p>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
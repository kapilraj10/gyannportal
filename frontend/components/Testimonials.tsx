import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

const testimonials = [
  {
    name: "Ramesh Sharma",
    role: "School Administrator",
    school: "Kathmandu Academy",
    quote:
      "GyannPortal has completely transformed how we manage our school. Fee collection used to take hours — now it takes minutes. The real-time dashboard gives me full visibility into every department.",
    initials: "RS",
    gradient: "from-primary-500 to-accent-500",
  },
  {
    name: "Sita Poudel",
    role: "Teacher",
    school: "Everest Secondary School",
    quote:
      "Taking attendance used to be a tedious manual process. Now I mark attendance in seconds on my phone. I can also track student performance and upload assignments directly. It saves me hours every week.",
    initials: "SP",
    gradient: "from-violet-500 to-primary-500",
  },
  {
    name: "Binod Thapa",
    role: "Parent",
    school: "Lumbini International School",
    quote:
      "As a parent, I love getting instant notifications about my child's attendance, grades, and school activities. The mobile app makes it so easy to stay involved in my daughter's education. Highly recommended!",
    initials: "BT",
    gradient: "from-accent-400 to-emerald-500",
  },
];

export default function Testimonials() {
  return (
    <section className="surface-gradient relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <div className="container-px relative max-w-7xl">
        <SectionHeading
          badge="Testimonials"
          title={
            <>
              Built for the people who
              <br />
              <span className="gradient-text">run and support schools.</span>
            </>
          }
          subtitle="Hear from administrators, teachers and parents who rely on GyannPortal every single day."
        />

        <div className="grid gap-5 md:grid-cols-3 lg:gap-7">
          {testimonials.map((t, index) => (
            <Reveal key={t.name} delay={index * 100} y={26} className="h-full">
              <figure className="group relative flex h-full flex-col rounded-2xl border border-deep-100 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-[0_24px_60px_-28px_rgba(37,99,235,0.28)]">
                <span className="pointer-events-none select-none text-5xl font-bold leading-none text-primary-100 transition-colors duration-300 group-hover:text-primary-200" aria-hidden>
                  &ldquo;
                </span>

                <div className="mb-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-deep-600">
                  {t.quote}
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3 border-t border-deep-100 pt-5">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-semibold text-white shadow-sm`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-deep-900">{t.name}</p>
                    <p className="text-xs text-deep-400">
                      {t.role} · {t.school}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
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

const testimonials = [
  {
    name: "Ramesh Sharma",
    role: "School Administrator",
    school: "Kathmandu Academy",
    quote:
      "GyannPortal has completely transformed how we manage our school. Fee collection used to take hours — now it takes minutes. The real-time dashboard gives me full visibility into every department.",
    initials: "RS",
    color: "bg-primary-100 text-primary-600",
  },
  {
    name: "Sita Poudel",
    role: "Teacher",
    school: "Everest Secondary School",
    quote:
      "Taking attendance used to be a tedious manual process. Now I mark attendance in seconds on my phone. I can also track student performance and upload assignments directly. It saves me hours every week.",
    initials: "SP",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Binod Thapa",
    role: "Parent",
    school: "Lumbini International School",
    quote:
      "As a parent, I love getting instant notifications about my child's attendance, grades, and school activities. The mobile app makes it so easy to stay involved in my daughter's education. Highly recommended!",
    initials: "BT",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function Testimonials() {
  const headerRef = useInView(0.15);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center mb-16 opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
            <span className="text-xs font-medium text-primary-600">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Built for the people who
            <br />
            <span className="gradient-text">run and support schools.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Hear from school administrators, teachers, and parents who use
            GyannPortal every day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-6 rounded-2xl border border-slate-100 bg-white card-shadow hover:card-shadow-lg transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-sm font-semibold shrink-0`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {testimonial.role} &middot; {testimonial.school}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

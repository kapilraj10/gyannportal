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

const plans = [
  {
    name: "Starter",
    description: "For small schools",
    price: "Contact for pricing",
    features: [
      "Up to 200 students",
      "Basic attendance",
      "Fee tracking",
      "Student profiles",
      "Parent notifications",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing schools",
    price: "Contact for pricing",
    features: [
      "Up to 1,000 students",
      "Advanced attendance",
      "Fees & payments",
      "Examinations & results",
      "Timetable management",
      "Library management",
      "Reports & analytics",
      "Priority support",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large institutions",
    price: "Contact for pricing",
    features: [
      "Unlimited students",
      "Everything in Professional",
      "Multi-branch support",
      "Custom modules",
      "API access",
      "Dedicated account manager",
      "On-site training",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  const headerRef = useInView(0.15);

  return (
    <section id="pricing" className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center mb-16 opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
            <span className="text-xs font-medium text-primary-600">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple plans for
            <br />
            <span className="gradient-text">every school.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            No hidden fees. No complicated pricing. Choose the plan that fits your
            school and scale as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? "bg-white border-2 border-primary-500 card-shadow-lg scale-[1.02]"
                  : "bg-white border border-slate-100 card-shadow hover:card-shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                <p className="text-sm font-medium text-primary-600">{plan.price}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

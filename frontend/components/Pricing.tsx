import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

const plans = [
  {
    name: "Starter",
    description: "For small schools",
    price: "Contact for pricing",
    priceNote: "Custom quote for your size",
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
    priceNote: "Most schools choose this",
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
    priceNote: "Tailored multi-branch setup",
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
  return (
    <section id="pricing" className="bg-white py-20 md:py-28">
      <div className="container-px max-w-7xl">
        <SectionHeading
          badge="Pricing"
          title={
            <>
              Simple plans for
              <br />
              <span className="gradient-text">every school.</span>
            </>
          }
          subtitle="No hidden fees. No complicated pricing. Tell us about your school and we'll match the right plan."
        />

        <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 100} y={28} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "card-shadow-lg bg-deep-900 text-white lg:-translate-y-3 lg:scale-[1.03]"
                    : "border border-deep-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-1 hover:border-primary-100 hover:shadow-[0_20px_50px_-24px_rgba(37,99,235,0.25)]"
                }`}
              >
                {plan.highlighted && (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-accent-400 to-transparent" />
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-primary-500/30">
                      Most Popular
                    </span>
                  </>
                )}

                <div className="mb-7">
                  <h3
                    className={`text-xl font-bold tracking-tight ${
                      plan.highlighted ? "text-white" : "text-deep-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${plan.highlighted ? "text-deep-300" : "text-deep-400"}`}>
                    {plan.description}
                  </p>
                  <div className="mt-5">
                    <p className={`text-2xl font-bold ${plan.highlighted ? "text-white" : "text-deep-900"}`}>
                      {plan.price}
                    </p>
                    <p className={`mt-1 text-xs ${plan.highlighted ? "text-deep-400" : "text-deep-400"}`}>
                      {plan.priceNote}
                    </p>
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.highlighted ? "bg-accent-500/20 text-accent-300" : "bg-primary-50 text-primary-600"
                        }`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className={`text-sm ${plan.highlighted ? "text-deep-100" : "text-deep-600"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:from-primary-400 hover:to-primary-500 hover:shadow-xl"
                      : "bg-deep-100 text-deep-800 hover:bg-deep-900 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 text-center text-sm text-deep-400">
            All plans include onboarding support, data migration and a free demo.{" "}
            <a href="#contact" className="font-semibold text-primary-600 underline-offset-4 hover:underline">
              Talk to us
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
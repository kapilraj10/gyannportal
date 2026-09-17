"use client";

import { useEffect, useRef, useState } from "react";

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

const faqs = [
  {
    question: "What is GyannPortal?",
    answer:
      "GyannPortal is a comprehensive School Management System that brings together administrators, teachers, students, and parents in one unified platform. It handles everything from student enrollment and attendance to examinations, fees, timetables, library management, and detailed reporting.",
  },
  {
    question: "Who can use GyannPortal?",
    answer:
      "GyannPortal is designed for all types of educational institutions — from small private schools to large public schools, higher secondary institutions, and colleges. It provides role-specific interfaces for school administrators, teachers, students, and parents.",
  },
  {
    question: "Can parents access the system?",
    answer:
      "Yes. Parents get their own login with a dedicated dashboard to monitor their child's attendance, academic performance, fee payments, school notices, and daily activities. They can also receive real-time notifications through the mobile app.",
  },
  {
    question: "Does GyannPortal have a mobile app?",
    answer:
      "Yes. GyannPortal offers mobile apps for both Android and iOS, giving students, teachers, parents, and administrators access to the platform from anywhere. The app supports push notifications for important announcements and updates.",
  },
  {
    question: "Is school data secure?",
    answer:
      "Absolutely. GyannPortal uses enterprise-grade security measures including end-to-end encryption, multi-factor authentication, role-based access control, regular automated backups, and complete audit logs. Your school's data is protected and never shared with third parties.",
  },
  {
    question: "Can the system support multiple schools?",
    answer:
      "Yes. GyannPortal's Enterprise plan supports multi-branch and multi-school management, allowing educational institutions and organizations to manage several schools from a single platform while keeping each school's data separate and secure.",
  },
  {
    question: "Can we customize GyannPortal?",
    answer:
      "Yes. GyannPortal is highly customizable. Schools can configure grading systems, report card formats, exam types, fee structures, and more to match their specific requirements. Custom modules can be developed for Enterprise clients.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy. Click the 'Get Started' button, fill in a simple form with your school's details, and our team will set up your account. Most schools are up and running within 48 hours, and our team provides onboarding support and training.",
  },
];

export default function FAQ() {
  const headerRef = useInView(0.15);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
            <span className="text-xs font-medium text-primary-600">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Frequently asked
            <span className="gradient-text"> questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                openIndex === index
                  ? "border-primary-100 card-shadow-lg"
                  : "border-slate-100 card-shadow hover:border-slate-200"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-800">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45 text-primary-500" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">
                    {faq.answer}
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
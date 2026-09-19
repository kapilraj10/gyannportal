"use client";

import { useState } from "react";
import Reveal from "./shared/Reveal";
import SectionHeading from "./shared/SectionHeading";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="container-px max-w-7xl">
        <SectionHeading
          badge="FAQ"
          title={
            <>
              Frequently asked
              <span className="gradient-text"> questions</span>
            </>
          }
          subtitle="Everything you need to know about getting your school on GyannPortal."
        />

        <div className="mx-auto max-w-3xl">
          <Reveal delay={80}>
            <div className="divide-y divide-deep-100 rounded-2xl border border-deep-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={faq.question} className={isOpen ? "bg-deep-50/40" : ""}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-deep-50/50 md:px-8"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`text-base font-semibold transition-colors duration-300 md:text-lg ${
                          isOpen ? "text-primary-600" : "text-deep-900"
                        }`}
                      >
                        {faq.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? "rotate-45 border-primary-200 bg-primary-50 text-primary-600"
                            : "border-deep-200 text-deep-400"
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-6 text-[15px] leading-relaxed text-deep-500 md:px-8">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 text-center text-sm text-deep-400">
              Still have questions?{" "}
              <a href="#contact" className="font-semibold text-primary-600 underline-offset-4 hover:underline">
                Contact our team
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
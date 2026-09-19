"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./shared/Reveal";

function CountUp({
  end,
  decimals = 0,
  duration = 1800,
}: {
  end: number;
  decimals?: number;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(end * eased);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString();

  return <span ref={ref}>{formatted}</span>;
}

const stats = [
  { value: 500, decimals: 0, suffix: "+", label: "Students managed", note: "Every day on the platform" },
  { value: 50, decimals: 0, suffix: "+", label: "Schools", note: "Across institutions" },
  { value: 99.9, decimals: 1, suffix: "%", label: "Uptime", note: "Always online, always ready" },
  { value: 24, decimals: 0, suffix: "/7", label: "Access", note: "Manage anytime, anywhere" },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden border-y border-deep-100/70 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-noise" />
      <div className="container-px relative max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 90} className="relative">
              <div
                className={`flex h-full flex-col justify-center px-6 py-10 text-center sm:px-10 lg:py-14 lg:text-left ${
                  index > 0 ? "lg:border-l lg:border-deep-100" : ""
                }`}
              >
                <p className="text-4xl font-bold tracking-tight text-deep-900 sm:text-5xl lg:text-6xl">
                  <CountUp end={stat.value} decimals={stat.decimals} />
                  <span className="gradient-text">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-sm font-semibold text-deep-800">{stat.label}</p>
                <p className="mt-0.5 hidden text-xs text-deep-400 sm:block">{stat.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
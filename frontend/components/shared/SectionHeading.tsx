import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  badge: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`${centered ? "mx-auto text-center" : ""} mb-12 max-w-2xl md:mb-16 ${className}`}
    >
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
          {badge}
        </span>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-deep-900 sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={170}>
          <p className="mt-5 text-lg leading-relaxed text-deep-500">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
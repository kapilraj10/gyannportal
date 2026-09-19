"use client";

const ACCENT_GRADIENTS: Record<string, string> = {
  blue: "from-primary-500 to-primary-600 shadow-primary-600/25",
  teal: "from-secondary-400 to-secondary-600 shadow-secondary-600/25",
  violet: "from-violet-500 to-violet-600 shadow-violet-600/25",
  amber: "from-amber-400 to-amber-500 shadow-amber-500/25",
};

const ACCENT_HOVER: Record<string, string> = {
  blue: "hover:border-primary-200",
  teal: "hover:border-secondary-200",
  violet: "hover:border-violet-200",
  amber: "hover:border-amber-200",
};

export default function StatCard({
  icon,
  label,
  value,
  trend,
  accent = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  accent?: "blue" | "teal" | "violet" | "amber";
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-deep-100 bg-white p-6 card-shadow card-hover ${ACCENT_HOVER[accent]}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary-50 to-secondary-100 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div
        className={`relative mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 text-white shadow-lg ${ACCENT_GRADIENTS[accent]}`}
      >
        {icon}
      </div>

      <p className="relative text-sm font-medium text-deep-500">{label}</p>

      <p className="relative mt-1 text-2xl font-bold tracking-tight text-deep-900">
        {value}
      </p>

      {trend && (
        <p className="relative mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-100">
          {trend}
        </p>
      )}
    </div>
  );
}
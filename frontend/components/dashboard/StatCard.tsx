"use client";

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
  const accents: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-xl p-3 ${accents[accent]}`}>
        {icon}
      </div>

      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>

      {trend && (
        <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
      )}
    </div>
  );
}
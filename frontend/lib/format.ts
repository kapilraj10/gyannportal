/** Small presentation helpers shared across pages. */

export function initials(name?: string | null): string {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, options);
}

export function formatDateTime(
  value?: string | Date | null,
): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercent(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

export const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-500/20",
  SUSPENDED: "bg-rose-50 text-rose-700 ring-rose-600/20",
  COMPLETED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  GRADED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  LATE: "bg-amber-50 text-amber-700 ring-amber-600/20",
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-500/20",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  SCHEDULED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  ONGOING: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/20",
  PRESENT: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  ABSENT: "bg-rose-50 text-rose-700 ring-rose-600/20",
  EXCUSED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  HALF_DAY: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export function statusStyle(status?: string): string {
  return STATUS_STYLES[status ?? ""] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
}

export function titleCase(value?: string): string {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export function gradeFromMarks(marks: number, maxMarks: number): string {
  if (maxMarks <= 0) return "";
  const pct = (marks / maxMarks) * 100;

  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "NG";
}
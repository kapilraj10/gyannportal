import { statusStyle } from "@/lib/format";

export default function Badge({
  status,
  children,
}: {
  status?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyle(status)}`}
    >
      {children ?? status}
    </span>
  );
}
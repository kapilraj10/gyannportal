import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-deep-200 bg-deep-50/40 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-deep-300 card-shadow">
        <Inbox className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-deep-700">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-deep-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
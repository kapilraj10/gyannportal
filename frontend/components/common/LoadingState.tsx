export default function LoadingState({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-10 text-deep-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-deep-200 border-t-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
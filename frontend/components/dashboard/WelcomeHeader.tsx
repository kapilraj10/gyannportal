export default function WelcomeHeader({
  name,
  eyebrow = "Welcome back",
  subtitle,
  children,
}: {
  name: string;
  eyebrow?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-deep-400">{eyebrow}</p>
        <h2 className="mt-1.5 flex items-center gap-3 text-2xl font-bold tracking-tight text-deep-900 sm:text-3xl">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-sm font-bold text-white shadow-glow">
            {initials}
          </span>
          {name}
        </h2>
        {subtitle && <p className="mt-2 text-deep-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
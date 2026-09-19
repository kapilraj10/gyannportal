"use client";

import { Loader2 } from "lucide-react";

/** Shared form primitives so all pages look consistent. */

export function fieldClass(error?: string): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-deep-900 shadow-sm outline-none transition placeholder:text-deep-400 focus:ring-4 ${
    error
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
      : "border-deep-200 focus:border-primary-500 focus:ring-primary-100/60"
  }`;
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-deep-700">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
      {!error && hint && (
        <span className="mt-1 block text-xs text-deep-400">{hint}</span>
      )}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return <input className={`${fieldClass(error)} ${className ?? ""}`} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  const { error, className, children, ...rest } = props;
  return (
    <select className={`${fieldClass(error)} ${className ?? ""}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <textarea className={`${fieldClass(error)} ${className ?? ""}`} {...rest} />
  );
}

export function Button({
  loading,
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.55)] hover:from-primary-700 hover:to-primary-600",
    secondary:
      "bg-white text-deep-700 ring-1 ring-deep-200 hover:bg-deep-50 hover:text-deep-900",
    ghost: "text-deep-600 hover:bg-deep-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-60 ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${variants[variant]} ${className ?? ""}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-deep-100 bg-white card-shadow">
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-deep-100 px-5 py-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-deep-900">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-deep-500">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
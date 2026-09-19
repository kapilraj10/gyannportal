"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

/**
 * Route guard used at the top of protected pages.
 *
 * - Eventual guard: while the session is loading we render a loading state;
 * - Unauthenticated users are redirected to `/login`;
 * - Users whose role is not allowed see a 403 screen instead of a redirect
 *   loop (protects server-backed routes that ignore unknown roles).
 */
export default function ProtectedPage({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (roles.length > 0 && !roles.includes(user?.role ?? "")) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            You don&apos;t have access to this page
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The current account does not have the required role for this
            section.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="mt-6 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
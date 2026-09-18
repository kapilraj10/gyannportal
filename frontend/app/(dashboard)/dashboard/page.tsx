"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardRoute } from "@/lib/roles";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(getDashboardRoute(user));
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      Loading dashboard...
    </div>
  );
}
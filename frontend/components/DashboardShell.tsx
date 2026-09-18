"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Users,
  Building2,
  CalendarDays,
  FileText,
  Settings,
  X,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS, UserRole } from "@/lib/roles";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: "Overview", href: "/dashboard/super-admin", icon: LayoutDashboard },
    { label: "Schools", href: "/dashboard/super-admin/schools", icon: School },
    { label: "Users", href: "/dashboard/super-admin/users", icon: Users },
    { label: "Reports", href: "/dashboard/super-admin/reports", icon: FileText },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: Settings },
  ],
  SCHOOL_ADMIN: [
    { label: "Overview", href: "/dashboard/school-admin", icon: LayoutDashboard },
    { label: "Students", href: "/dashboard/school-admin/students", icon: Users },
    { label: "Teachers", href: "/dashboard/school-admin/teachers", icon: Users },
    { label: "Branches", href: "/dashboard/school-admin/branches", icon: Building2 },
    { label: "Timetable", href: "/dashboard/school-admin/timetable", icon: CalendarDays },
    { label: "Reports", href: "/dashboard/school-admin/reports", icon: FileText },
    { label: "Settings", href: "/dashboard/school-admin/settings", icon: Settings },
  ],
  TEACHER: [
    { label: "Overview", href: "/dashboard/teacher", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/teacher/classes", icon: School },
    { label: "Students", href: "/dashboard/teacher/students", icon: Users },
    { label: "Timetable", href: "/dashboard/teacher/timetable", icon: CalendarDays },
    { label: "Marks", href: "/dashboard/teacher/marks", icon: FileText },
    { label: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
  ],
  PARENT: [
    { label: "Overview", href: "/dashboard/parent", icon: LayoutDashboard },
    { label: "Children", href: "/dashboard/parent/children", icon: Users },
    { label: "Attendance", href: "/dashboard/parent/attendance", icon: CalendarDays },
    { label: "Fees", href: "/dashboard/parent/fees", icon: FileText },
    { label: "Notices", href: "/dashboard/parent/notices", icon: FileText },
  ],
  STUDENT: [
    { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Classes", href: "/dashboard/student/classes", icon: School },
    { label: "Timetable", href: "/dashboard/student/timetable", icon: CalendarDays },
    { label: "Marks", href: "/dashboard/student/marks", icon: FileText },
    { label: "Fees", href: "/dashboard/student/fees", icon: FileText },
    { label: "Notices", href: "/dashboard/student/notices", icon: FileText },
  ],
};

export default function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!loading && (!user || user.role !== role)) {
      router.replace("/dashboard");
    }
  }, [loading, user, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== role) {
    return null;
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const navItems = NAV_ITEMS[role];

  const sidebar = (
    <aside className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <Image
          src="/logo1.png"
          alt="GyannPortal logo"
          width={1536}
          height={1024}
          className="h-9 w-auto object-contain"
        />
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active =
            item.href === pathname || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {user.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.name}
            </p>

            <p className="truncate text-xs text-slate-500">
              {ROLE_LABELS[role]}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col lg:bg-white lg:border-r lg:border-slate-200">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2.5">
                <GraduationCap size={22} className="text-blue-600" />

                <div>
                  <h1 className="text-sm font-bold text-slate-900">
                    GyannPortal
                  </h1>

                  <p className="text-xs text-slate-500">
                    {user.school.name}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS, getDashboardRoute, type UserRole } from "@/lib/roles";
import { titleCase } from "@/lib/format";
import type { PermissionName } from "@/lib/permissions";

import NotificationBell from "@/components/notifications/NotificationBell";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionName;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: Record<UserRole, NavGroup[]> = {
  SUPER_ADMIN: [
    {
      label: "General",
      items: [
        { label: "Overview", href: "/dashboard/super-admin", icon: LayoutDashboard },
        { label: "Schools", href: "/dashboard/super-admin/schools", icon: School, permission: "SCHOOL_READ" },
        { label: "Users", href: "/dashboard/super-admin/users", icon: Users, permission: "USER_READ" },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Audit Logs", href: "/dashboard/super-admin/audit-logs", icon: ShieldCheck, permission: "AUDIT_LOG_READ" },
        { label: "Notifications", href: "/dashboard/super-admin/notifications", icon: Newspaper, permission: "NOTIFICATION_READ" },
        { label: "Settings", href: "/dashboard/super-admin/settings", icon: Settings },
      ],
    },
  ],
  SCHOOL_ADMIN: [
    {
      label: "General",
      items: [
        { label: "Overview", href: "/dashboard/school-admin", icon: LayoutDashboard },
        { label: "Students", href: "/dashboard/school-admin/students", icon: Users, permission: "STUDENT_READ" },
        { label: "Teachers", href: "/dashboard/school-admin/teachers", icon: UsersRound, permission: "TEACHER_READ" },
        { label: "Parents", href: "/dashboard/school-admin/parents", icon: Users, permission: "PARENT_READ" },
      ],
    },
    {
      label: "Academics",
      items: [
        { label: "Classes", href: "/dashboard/school-admin/classes", icon: School, permission: "CLASS_READ" },
        { label: "Sections", href: "/dashboard/school-admin/sections", icon: BookOpen, permission: "CLASS_READ" },
        { label: "Subjects", href: "/dashboard/school-admin/subjects", icon: BookOpen, permission: "CLASS_READ" },
        { label: "Courses", href: "/dashboard/school-admin/courses", icon: GraduationCap, permission: "CLASS_READ" },
        { label: "Academic Years", href: "/dashboard/school-admin/academic-years", icon: CalendarDays, permission: "CLASS_READ" },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Enrollments", href: "/dashboard/school-admin/enrollments", icon: UsersRound, permission: "STUDENT_READ" },
        { label: "Attendance", href: "/dashboard/school-admin/attendance", icon: CalendarDays, permission: "ATTENDANCE_READ" },
        { label: "Assignments", href: "/dashboard/school-admin/assignments", icon: ClipboardList, permission: "ASSIGNMENT_READ" },
        { label: "Exams", href: "/dashboard/school-admin/exams", icon: FileBarChart, permission: "EXAM_READ" },
        { label: "Results", href: "/dashboard/school-admin/results", icon: FileBarChart, permission: "RESULT_READ" },
        { label: "Branches", href: "/dashboard/school-admin/branches", icon: Building2, permission: "SCHOOL_READ" },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Notifications", href: "/dashboard/school-admin/notifications", icon: Newspaper, permission: "NOTIFICATION_READ" },
        { label: "Audit Logs", href: "/dashboard/school-admin/audit-logs", icon: ShieldCheck, permission: "AUDIT_LOG_READ" },
        { label: "Settings", href: "/dashboard/school-admin/settings", icon: Settings },
      ],
    },
  ],
  TEACHER: [
    {
      label: "General",
      items: [
        { label: "Overview", href: "/dashboard/teacher", icon: LayoutDashboard },
        { label: "My Classes", href: "/dashboard/teacher/classes", icon: School, permission: "CLASS_READ" },
        { label: "My Students", href: "/dashboard/teacher/students", icon: Users, permission: "STUDENT_READ" },
      ],
    },
    {
      label: "Teaching",
      items: [
        { label: "Attendance", href: "/dashboard/teacher/attendance", icon: CalendarDays, permission: "ATTENDANCE_READ" },
        { label: "Assignments", href: "/dashboard/teacher/assignments", icon: ClipboardList, permission: "ASSIGNMENT_READ" },
        { label: "Exams", href: "/dashboard/teacher/exams", icon: FileBarChart, permission: "EXAM_READ" },
        { label: "Marks", href: "/dashboard/teacher/marks", icon: FileBarChart, permission: "RESULT_READ" },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Notifications", href: "/dashboard/teacher/notifications", icon: Newspaper, permission: "NOTIFICATION_READ" },
        { label: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
      ],
    },
  ],
  PARENT: [
    {
      label: "General",
      items: [
        { label: "Overview", href: "/dashboard/parent", icon: LayoutDashboard },
        { label: "My Children", href: "/dashboard/parent/children", icon: Users, permission: "STUDENT_READ" },
      ],
    },
    {
      label: "Academics",
      items: [
        { label: "Attendance", href: "/dashboard/parent/attendance", icon: CalendarDays, permission: "ATTENDANCE_READ" },
        { label: "Assignments", href: "/dashboard/parent/assignments", icon: ClipboardList, permission: "ASSIGNMENT_READ" },
        { label: "Exams", href: "/dashboard/parent/exams", icon: FileBarChart, permission: "EXAM_READ" },
        { label: "Results", href: "/dashboard/parent/results", icon: FileBarChart, permission: "RESULT_READ" },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Notifications", href: "/dashboard/parent/notifications", icon: Newspaper, permission: "NOTIFICATION_READ" },
      ],
    },
  ],
  STUDENT: [
    {
      label: "General",
      items: [
        { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
        { label: "My Classes", href: "/dashboard/student/classes", icon: School, permission: "CLASS_READ" },
      ],
    },
    {
      label: "Academics",
      items: [
        { label: "Attendance", href: "/dashboard/student/attendance", icon: CalendarDays, permission: "ATTENDANCE_READ" },
        { label: "Assignments", href: "/dashboard/student/assignments", icon: ClipboardList, permission: "ASSIGNMENT_READ" },
        { label: "Exams", href: "/dashboard/student/exams", icon: FileBarChart, permission: "EXAM_READ" },
        { label: "Marks", href: "/dashboard/student/marks", icon: FileBarChart, permission: "RESULT_READ" },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Notifications", href: "/dashboard/student/notifications", icon: Newspaper, permission: "NOTIFICATION_READ" },
        { label: "Settings", href: "/dashboard/student/settings", icon: Settings },
      ],
    },
  ],
};

const SIDEBAR_KEY = "gyannportal.sidebar.collapsed";
const SIDEBAR_EXPANDED = "lg:w-72";
const SIDEBAR_COLLAPSED = "lg:w-[4.5rem]";

export default function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, can } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      // Ignore — localStorage may be unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      // Ignore — localStorage may be unavailable.
    }
  }, [collapsed]);

  useEffect(() => {
    if (!loading && user && user.role !== role) {
      router.replace(getDashboardRoute(user));
    }
  }, [loading, user, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-deep-200 border-t-primary-600" />
          <p className="text-sm text-deep-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return null;
  }

  const roleLabel = ROLE_LABELS[role];

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  // Build the visible nav, filtering permission-protected items.
  const nav = NAV_GROUPS[role]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const sectionTitles: Record<string, string> = {
    "super-admin": "Super Admin",
    "school-admin": "School Admin",
    teacher: "Teacher",
    parent: "Parent",
    student: "Student",
  };

  const breadcrumb = (() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length <= 1) return { section: "", page: "" };

    const section = sectionTitles[segments[1]] ?? titleCase(segments[1]);
    const page = segments.length > 2 ? titleCase(segments[2]) : "";

    return { section, page };
  })();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const sidebar = (mini: boolean) => (
    <aside className="flex h-full flex-col">
      <div
        className={`flex items-center border-b border-deep-100 ${
          mini ? "justify-center px-2 py-5" : "gap-3 px-6 py-5"
        }`}
      >
        {mini ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-glow">
            <GraduationCap size={18} />
          </span>
        ) : (
          <Image
            src="/logo1.png"
            alt="GyannPortal logo"
            width={1536}
            height={1024}
            className="h-9 w-auto object-contain"
            priority
          />
        )}
      </div>

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {nav.map((group) => (
          <div key={group.label}>
            {!mini && (
              <p className="px-3.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-deep-400">
                {group.label}
              </p>
            )}
            <div className={mini ? "space-y-1" : "space-y-0.5"}>
              {group.items.map((item) => {
                const active =
                  item.href === pathname ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={mini ? item.label : undefined}
                    className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
                      mini ? "justify-center py-3" : "gap-3 px-3.5 py-2.5"
                    } ${
                      active
                        ? "bg-primary-50 text-primary-700"
                        : "text-deep-600 hover:bg-deep-100/70 hover:text-deep-900"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 h-5 w-1 rounded-r-full bg-primary-600" />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 2}
                      className="shrink-0 transition-transform group-hover:scale-110"
                    />
                    {!mini && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-deep-100 p-3">
        <div
          className={`flex rounded-xl ${
            mini
              ? "flex-col items-center gap-2 py-1"
              : "items-center gap-3 bg-deep-50/70 p-3"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>

          {!mini && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-deep-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-deep-500">{roleLabel}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-deep-500 transition hover:bg-deep-100 hover:text-deep-700"
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
    <div className="min-h-screen surface-gradient">
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col lg:border-r lg:border-deep-100 lg:bg-white transition-[width] duration-300 ease-out ${
          collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED
        }`}
      >
        {sidebar(collapsed)}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-deep-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-deep-100 text-deep-500"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            {sidebar(false)}
          </div>
        </div>
      )}

      <div
        className={`transition-[padding] duration-300 ease-out ${
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-72"
        }`}
      >
        <header className="sticky top-0 z-30 glass border-b border-deep-100/70">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-deep-600 transition hover:bg-deep-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <button
                onClick={() => setCollapsed((c) => !c)}
                className="hidden rounded-lg p-2 text-deep-500 transition hover:bg-deep-100 hover:text-deep-800 lg:inline-flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>

              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm text-deep-400">
                  <GraduationCap size={15} className="text-primary-600" />
                  <span className="font-semibold text-deep-900">GyannPortal</span>
                  {breadcrumb.section && (
                    <>
                      <span>/</span>
                      <span className="truncate">{breadcrumb.section}</span>
                    </>
                  )}
                  {breadcrumb.page && (
                    <>
                      <span>/</span>
                      <span className="truncate">{breadcrumb.page}</span>
                    </>
                  )}
                </p>
                <p className="truncate text-xs text-deep-400">
                  {user.school?.name ?? "Platform"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <NotificationBell basePath={`/dashboard/${role}`} />
              <button
                onClick={handleLogout}
                className="ml-1 flex items-center gap-2 rounded-lg border border-deep-200 px-3 py-2 text-sm text-deep-600 transition hover:bg-deep-100/70 hover:text-deep-800"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
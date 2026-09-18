import { User } from "@/types/auth";

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "PARENT"
  | "STUDENT";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  SCHOOL_ADMIN: "School Administrator",
  TEACHER: "Teacher",
  PARENT: "Parent",
  STUDENT: "Student",
};

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: "/dashboard/super-admin",
  SCHOOL_ADMIN: "/dashboard/school-admin",
  TEACHER: "/dashboard/teacher",
  PARENT: "/dashboard/parent",
  STUDENT: "/dashboard/student",
};

export function isUserRole(role: string): role is UserRole {
  return Object.prototype.hasOwnProperty.call(ROLE_DASHBOARD, role);
}

export function getDashboardRoute(user: Pick<User, "role">): string {
  if (isUserRole(user.role)) {
    return ROLE_DASHBOARD[user.role];
  }
  return "/dashboard";
}
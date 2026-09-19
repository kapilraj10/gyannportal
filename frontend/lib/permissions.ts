import type { User } from "@/types/domain";

import type { UserRole } from "./roles";

/**
 * Permission registry mirrors the backend `Permission` enum. Used by the
 * `<Can>` component and `can()` helper to render permission-aware UI.
 *
 * These names are only used for display-gating; the backend `PermissionsGuard`
 * remains authoritative.
 */
export type PermissionName =
  | "SCHOOL_CREATE"
  | "SCHOOL_READ"
  | "SCHOOL_UPDATE"
  | "SCHOOL_DELETE"
  | "USER_CREATE"
  | "USER_READ"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "STUDENT_CREATE"
  | "STUDENT_READ"
  | "STUDENT_UPDATE"
  | "STUDENT_DELETE"
  | "TEACHER_CREATE"
  | "TEACHER_READ"
  | "TEACHER_UPDATE"
  | "TEACHER_DELETE"
  | "PARENT_CREATE"
  | "PARENT_READ"
  | "PARENT_UPDATE"
  | "PARENT_DELETE"
  | "CLASS_CREATE"
  | "CLASS_READ"
  | "CLASS_UPDATE"
  | "CLASS_DELETE"
  | "ATTENDANCE_CREATE"
  | "ATTENDANCE_READ"
  | "ATTENDANCE_UPDATE"
  | "ASSIGNMENT_CREATE"
  | "ASSIGNMENT_READ"
  | "ASSIGNMENT_UPDATE"
  | "ASSIGNMENT_DELETE"
  | "EXAM_CREATE"
  | "EXAM_READ"
  | "EXAM_UPDATE"
  | "EXAM_DELETE"
  | "RESULT_CREATE"
  | "RESULT_READ"
  | "RESULT_UPDATE"
  | "NOTIFICATION_CREATE"
  | "NOTIFICATION_READ"
  | "AUDIT_LOG_READ";

export const PERMISSION_GROUP_LABELS: Record<string, string> = {
  SCHOOL: "School",
  USER: "Users",
  STUDENT: "Students",
  TEACHER: "Teachers",
  PARENT: "Parents",
  CLASS: "Classes",
  ATTENDANCE: "Attendance",
  ASSIGNMENT: "Assignments",
  EXAM: "Exams",
  RESULT: "Results",
  NOTIFICATION: "Notifications",
  AUDIT_LOG: "Audit Logs",
};

/** Default permission sets per role — mirrors `prisma/seed.ts`. */
export const ROLE_PERMISSIONS: Record<
  UserRole,
  ReadonlyArray<PermissionName>
> = {
  SUPER_ADMIN: [
    "SCHOOL_CREATE",
    "SCHOOL_READ",
    "SCHOOL_UPDATE",
    "SCHOOL_DELETE",
    "USER_CREATE",
    "USER_READ",
    "USER_UPDATE",
    "USER_DELETE",
    "STUDENT_CREATE",
    "STUDENT_READ",
    "STUDENT_UPDATE",
    "STUDENT_DELETE",
    "TEACHER_CREATE",
    "TEACHER_READ",
    "TEACHER_UPDATE",
    "TEACHER_DELETE",
    "PARENT_CREATE",
    "PARENT_READ",
    "PARENT_UPDATE",
    "PARENT_DELETE",
    "CLASS_CREATE",
    "CLASS_READ",
    "CLASS_UPDATE",
    "CLASS_DELETE",
    "ATTENDANCE_CREATE",
    "ATTENDANCE_READ",
    "ATTENDANCE_UPDATE",
    "ASSIGNMENT_CREATE",
    "ASSIGNMENT_READ",
    "ASSIGNMENT_UPDATE",
    "ASSIGNMENT_DELETE",
    "EXAM_CREATE",
    "EXAM_READ",
    "EXAM_UPDATE",
    "EXAM_DELETE",
    "RESULT_CREATE",
    "RESULT_READ",
    "RESULT_UPDATE",
    "NOTIFICATION_CREATE",
    "NOTIFICATION_READ",
    "AUDIT_LOG_READ",
  ],
  SCHOOL_ADMIN: [
    "SCHOOL_READ",
    "SCHOOL_UPDATE",
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "STUDENT_READ",
    "STUDENT_CREATE",
    "STUDENT_UPDATE",
    "STUDENT_DELETE",
    "TEACHER_READ",
    "TEACHER_CREATE",
    "TEACHER_UPDATE",
    "TEACHER_DELETE",
    "PARENT_READ",
    "PARENT_CREATE",
    "PARENT_UPDATE",
    "PARENT_DELETE",
    "CLASS_READ",
    "CLASS_CREATE",
    "CLASS_UPDATE",
    "CLASS_DELETE",
    "ATTENDANCE_READ",
    "ATTENDANCE_CREATE",
    "ATTENDANCE_UPDATE",
    "ASSIGNMENT_READ",
    "ASSIGNMENT_CREATE",
    "ASSIGNMENT_UPDATE",
    "ASSIGNMENT_DELETE",
    "EXAM_READ",
    "EXAM_CREATE",
    "EXAM_UPDATE",
    "EXAM_DELETE",
    "RESULT_READ",
    "RESULT_CREATE",
    "RESULT_UPDATE",
    "NOTIFICATION_READ",
    "NOTIFICATION_CREATE",
    "AUDIT_LOG_READ",
  ],
  TEACHER: [
    "STUDENT_READ",
    "CLASS_READ",
    "ATTENDANCE_READ",
    "ATTENDANCE_CREATE",
    "ATTENDANCE_UPDATE",
    "ASSIGNMENT_READ",
    "ASSIGNMENT_CREATE",
    "ASSIGNMENT_UPDATE",
    "EXAM_READ",
    "RESULT_READ",
    "RESULT_CREATE",
    "RESULT_UPDATE",
    "NOTIFICATION_READ",
    "NOTIFICATION_CREATE",
  ],
  PARENT: [
    "STUDENT_READ",
    "CLASS_READ",
    "ATTENDANCE_READ",
    "ASSIGNMENT_READ",
    "EXAM_READ",
    "RESULT_READ",
    "NOTIFICATION_READ",
  ],
  STUDENT: [
    "STUDENT_READ",
    "CLASS_READ",
    "ATTENDANCE_READ",
    "ASSIGNMENT_READ",
    "EXAM_READ",
    "RESULT_READ",
    "NOTIFICATION_READ",
  ],
};

export function getRolePermissions(role: string): PermissionName[] {
  return [...(ROLE_PERMISSIONS[role as UserRole] ?? [])];
}

export const hasRole = (
  user: Pick<User, "role"> | null | undefined,
  ...roles: string[]
): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const hasPermission = (
  user: Pick<User, "role" | "permissions"> | null | undefined,
  permission: PermissionName,
): boolean => {
  if (!user) return false;

  if (user.role === "SUPER_ADMIN") return true;

  // Prefer the server-provided permission list when available.
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }

  return ROLE_PERMISSIONS[(user.role as UserRole) ?? ""]?.includes(permission) ?? false;
};

export const can = hasPermission;
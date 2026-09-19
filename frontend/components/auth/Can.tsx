"use client";

import type { PermissionName } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

/**
 * Permission-aware wrapper. Renders `children` only when the current user has
 * the required role and/or permission. The backend remains authoritative.
 */
export default function Can({
  permission,
  roles,
  children,
  fallback = null,
}: {
  permission?: PermissionName;
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, hasRole } = useAuth();

  const roleOk = roles ? hasRole(...roles) : true;
  const permissionOk = permission ? can(permission) : true;

  return roleOk && permissionOk ? <>{children}</> : <>{fallback}</>;
}
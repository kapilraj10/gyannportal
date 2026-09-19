import { hasPermission, hasRole } from "@/lib/permissions";
import type { PermissionName } from "@/lib/permissions";
import type { User } from "@/types/domain";

/**
 * Permission hooks. Mirrors the backend guard semantics; the backend remains
 * authoritative for authorization — these only drive the UI.
 */
export function usePermission(user: User | null): {
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (permission: PermissionName) => boolean;
  can: (permission: PermissionName) => boolean;
} {
  const checkRole = (...roles: string[]) => hasRole(user, ...roles);
  const checkPermission = (permission: PermissionName) =>
    hasPermission(user, permission);

  return {
    hasRole: checkRole,
    hasPermission: checkPermission,
    can: checkPermission,
  };
}
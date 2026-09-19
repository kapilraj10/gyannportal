import type { RoleSummary } from "@/types/domain";

import { get, getList } from "./helpers";
import type { PaginationParams } from "@/types/api";

export interface RoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export const rolesApi = {
  list: (): Promise<RoleSummary[]> => get<RoleSummary[]>("/roles"),

  get: (id: string): Promise<RoleSummary> => get<RoleSummary>(`/roles/${id}`),

  getGroupedPermissions: (): Promise<Record<string, unknown>> =>
    get<Record<string, unknown>>("/permissions/grouped"),
};

export const permissionsApi = {
  list: (params?: PaginationParams): Promise<unknown> =>
    getList<unknown>("/permissions", params),

  grouped: (): Promise<Record<string, unknown>> =>
    get<Record<string, unknown>>("/permissions/grouped"),
};
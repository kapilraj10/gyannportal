import type { ListResult, PaginationParams } from "@/types/api";
import type { AuditLog, School, User, UserStatus } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";
import type { SchoolInput } from "./schools";

export const superAdminApi = {
  getDashboard: (): Promise<Record<string, unknown>> =>
    get<Record<string, unknown>>("/super-admin/dashboard"),

  listSchools: (params?: PaginationParams): Promise<ListResult<School>> =>
    getList<School>("/super-admin/schools", params),

  getSchool: (id: string): Promise<School> =>
    get<School>(`/super-admin/schools/${id}`),

  createSchool: (input: SchoolInput): Promise<School> =>
    post<School, SchoolInput>("/super-admin/schools", input).then(
      (r) => r.data,
    ),

  updateSchool: (id: string, input: Partial<SchoolInput>): Promise<School> =>
    patch<School, Partial<SchoolInput>>(`/super-admin/schools/${id}`, input).then(
      (r) => r.data,
    ),

  deleteSchool: (id: string): Promise<null> =>
    del<null>(`/super-admin/schools/${id}`).then(() => null),

  listUsers: (params?: PaginationParams): Promise<ListResult<User>> =>
    getList<User>("/super-admin/users", params),

  updateUserStatus: (id: string, status: UserStatus): Promise<unknown> =>
    patch<unknown, { status: UserStatus }>(`/super-admin/users/${id}/status`, {
      status,
    }).then((r) => r.data),

  listAuditLogs: (params?: PaginationParams): Promise<ListResult<AuditLog>> =>
    getList<AuditLog>("/super-admin/audit-logs", params),
};
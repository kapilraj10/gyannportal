import type { ListResult, PaginationParams } from "@/types/api";
import type { User, UserStatus } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface AdminUserInput {
  name: string;
  email: string;
  phone?: string;
  roleId?: string;
  role?: string;
  password?: string;
  status?: UserStatus;
}

export const usersApi = {
  list: (params?: PaginationParams): Promise<ListResult<User>> =>
    getList<User>("/admin/users", params),

  get: (id: string): Promise<User> => get<User>(`/admin/users/${id}`),

  create: (input: AdminUserInput): Promise<User> =>
    post<User, AdminUserInput>("/admin/users", input).then((r) => r.data),

  update: (id: string, input: Partial<AdminUserInput>): Promise<User> =>
    patch<User, Partial<AdminUserInput>>(`/admin/users/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> => del<null>(`/admin/users/${id}`).then(() => null),
};
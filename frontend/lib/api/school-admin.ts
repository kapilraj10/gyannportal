import type { School } from "@/types/domain";

import { get, patch } from "./helpers";

export const schoolAdminApi = {
  getDashboard: (schoolId?: string): Promise<Record<string, unknown>> =>
    get<Record<string, unknown>>("/school-admin/dashboard", {
      ...(schoolId ? { schoolId } : {}),
    }),

  getProfile: (): Promise<Record<string, unknown>> =>
    get<Record<string, unknown>>("/school-admin/profile"),

  updateProfile: (input: {
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<School> =>
    patch<School, { name?: string; phone?: string; avatar?: string }>(
      "/school-admin/profile",
      input,
    ).then((r) => r.data),
};
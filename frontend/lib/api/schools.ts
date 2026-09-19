import type { ListResult, PaginationParams } from "@/types/api";
import type { School, SchoolLevel, SchoolStatus, SchoolType } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface SchoolInput {
  name: string;
  code: string;
  registrationNumber?: string;
  schoolType?: SchoolType;
  level?: SchoolLevel;
  establishedYear?: number;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status?: SchoolStatus;
}

export const schoolsApi = createResourceApi<School, SchoolInput, Partial<SchoolInput>>(
  "/schools",
);

export const listSchools = (params?: PaginationParams): Promise<ListResult<School>> =>
  schoolsApi.list(params);
import type { AcademicYear } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface AcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  status?: string;
}

export const academicYearsApi = createResourceApi<
  AcademicYear,
  AcademicYearInput,
  Partial<AcademicYearInput>
>("/academic-years");
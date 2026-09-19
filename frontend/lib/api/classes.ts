import type { ClassEntity } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface ClassInput {
  name: string;
  code: string;
  academicYearId?: string;
  description?: string;
  status?: string;
}

export const classesApi = createResourceApi<
  ClassEntity,
  ClassInput,
  Partial<ClassInput>
>("/classes");
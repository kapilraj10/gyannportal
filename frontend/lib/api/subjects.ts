import type { Subject } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface SubjectInput {
  name: string;
  code: string;
  description?: string;
  status?: string;
}

export const subjectsApi = createResourceApi<Subject, SubjectInput, Partial<SubjectInput>>(
  "/subjects",
);
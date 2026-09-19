import type { Section } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface SectionInput {
  classId: string;
  name: string;
  capacity?: number;
  status?: string;
}

export const sectionsApi = createResourceApi<Section, SectionInput, Partial<SectionInput>>(
  "/sections",
);
import type { Branch } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface BranchInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
  status?: string;
}

export const branchesApi = createResourceApi<Branch, BranchInput, Partial<BranchInput>>(
  "/branches",
);
import type { ListResult, PaginationParams } from "@/types/api";
import type { AuditLog } from "@/types/domain";

import { getList } from "./helpers";

export const auditLogsApi = {
  list: (params?: PaginationParams): Promise<ListResult<AuditLog>> =>
    getList<AuditLog>("/audit-logs", params),
};
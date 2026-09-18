import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { DatabaseService } from '../../database/database.service.js';
import {
  getSkip,
  paginate,
} from '../../common/pagination/pagination.dto.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { Role } from '../../common/enums/role.enum.js';
import { QueryAuditLogDto } from './dto/query-audit-log.dto.js';

export interface AuditLogInput {
  userId: string;
  schoolId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: DatabaseService) {}

  /**
   * Best-effort audit logging. Never breaks the calling operation.
   */
  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId,
          schoolId: input.schoolId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          metadata: input.metadata ?? undefined,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to write audit log: ${message}`);
    }
  }

  /**
   * Paginated audit-log listing.
   * SUPER_ADMIN sees every log; everyone else is scoped to their school.
   */
  async list(user: AuthUser, query: QueryAuditLogDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.AuditLogWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    } else if (query.schoolId) {
      where.schoolId = query.schoolId;
    }

    if (query.action) where.action = query.action;
    if (query.entity) where.entity = query.entity;
    if (query.userId) where.userId = query.userId;

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          id: true,
          userId: true,
          schoolId: true,
          action: true,
          entity: true,
          entityId: true,
          metadata: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          school: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return paginate(logs, total, page, limit);
  }
}
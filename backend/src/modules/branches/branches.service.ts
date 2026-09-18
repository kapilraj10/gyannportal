import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AuditAction } from '../../common/enums/audit-action.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { getSkip, paginate } from '../../common/pagination/pagination.dto.js';
import {
  assertSameSchool,
  resolveSchoolId,
} from '../../common/helpers/access.helper.js';

import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';
import { QueryBranchDto } from './dto/query-branch.dto.js';

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateBranchDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    const existing = await this.prisma.branch.findFirst({
      where: { schoolId, name: dto.name.trim() },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Branch name already exists in this school');
    }

    const branch = await this.prisma.branch.create({
      data: {
        schoolId,
        name: dto.name.trim(),
        address: dto.address?.trim(),
        phone: dto.phone?.trim(),
        status: dto.status,
      },
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.BRANCH_CREATE,
      entity: 'Branch',
      entityId: branch.id,
    });

    return { message: 'Branch created successfully', data: branch };
  }

  async findAll(user: AuthUser, query: QueryBranchDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.BranchWhereInput = {};
    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [total, branches] = await Promise.all([
      this.prisma.branch.count({ where }),
      this.prisma.branch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        include: { _count: { select: { users: true } } },
      }),
    ]);

    return paginate(branches, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    assertSameSchool(user, branch.schoolId);
    return { message: 'Branch fetched successfully', data: branch };
  }

  async update(user: AuthUser, id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    assertSameSchool(user, branch.schoolId);

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        address: dto.address?.trim(),
        phone: dto.phone?.trim(),
        status: dto.status,
      },
    });

    return { message: 'Branch updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    assertSameSchool(user, branch.schoolId);

    await this.prisma.branch.delete({ where: { id } });
    return { message: 'Branch deleted successfully', data: null };
  }
}
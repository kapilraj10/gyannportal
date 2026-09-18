import {
  BadRequestException,
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

import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { QuerySectionDto } from './dto/query-section.dto.js';

const SECTION_SELECT = {
  id: true,
  schoolId: true,
  classId: true,
  name: true,
  capacity: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  class: { select: { id: true, name: true } },
} satisfies Prisma.SectionSelect;

@Injectable()
export class SectionsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateSectionDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    const cls = await this.prisma.class.findFirst({
      where: { id: dto.classId, schoolId },
      select: { id: true },
    });
    if (!cls) {
      throw new BadRequestException('Class not found in this school');
    }

    const dup = await this.prisma.section.findFirst({
      where: { classId: dto.classId, name: dto.name.trim() },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException('Section name already exists in this class');
    }

    const created = await this.prisma.section.create({
      data: {
        schoolId,
        classId: dto.classId,
        name: dto.name.trim(),
        capacity: dto.capacity,
        status: dto.status,
      },
      select: SECTION_SELECT,
    });

    return { message: 'Section created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QuerySectionDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.SectionWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.classId) where.classId = query.classId;
    if (query.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [total, rows] = await Promise.all([
      this.prisma.section.count({ where }),
      this.prisma.section.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...SECTION_SELECT,
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.section.findUnique({
      where: { id },
      select: SECTION_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Section not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Section fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateSectionDto) {
    const row = await this.prisma.section.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Section not found');
    }
    assertSameSchool(user, row.schoolId);

    const updated = await this.prisma.section.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        capacity: dto.capacity,
        status: dto.status,
        classId: dto.classId,
      },
      select: SECTION_SELECT,
    });

    return { message: 'Section updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.section.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Section not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.section.delete({ where: { id } });
    return { message: 'Section deleted successfully', data: null };
  }
}
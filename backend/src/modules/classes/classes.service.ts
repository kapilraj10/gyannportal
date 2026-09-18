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

import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { QueryClassDto } from './dto/query-class.dto.js';

const CLASS_SELECT = {
  id: true,
  schoolId: true,
  name: true,
  code: true,
  academicYearId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  academicYear: { select: { id: true, name: true } },
} satisfies Prisma.ClassSelect;

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateClassDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    await this.assertAcademicYearInSchool(dto.academicYearId, schoolId);

    const code = dto.code.trim().toUpperCase();
    const dup = await this.prisma.class.findUnique({
      where: { schoolId_code: { schoolId, code } },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException('Class code already exists in this school');
    }

    const created = await this.prisma.class.create({
      data: {
        schoolId,
        name: dto.name.trim(),
        code,
        academicYearId: dto.academicYearId,
        status: dto.status,
      },
      select: CLASS_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.CLASS_CREATE,
      entity: 'Class',
      entityId: created.id,
      metadata: { name: created.name, code },
    });

    return { message: 'Class created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QueryClassDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ClassWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.class.count({ where }),
      this.prisma.class.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...CLASS_SELECT,
          _count: {
            select: { sections: true, courses: true, enrollments: true },
          },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.class.findUnique({
      where: { id },
      select: {
        ...CLASS_SELECT,
        _count: {
          select: { sections: true, courses: true, enrollments: true },
        },
      },
    });
    if (!row) {
      throw new NotFoundException('Class not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Class fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateClassDto) {
    const row = await this.prisma.class.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Class not found');
    }
    assertSameSchool(user, row.schoolId);

    if (dto.academicYearId) {
      await this.assertAcademicYearInSchool(dto.academicYearId, row.schoolId);
    }

    const updated = await this.prisma.class.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        code: dto.code?.trim().toUpperCase(),
        academicYearId: dto.academicYearId,
        status: dto.status,
      },
      select: CLASS_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.CLASS_UPDATE,
      entity: 'Class',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Class updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.class.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Class not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.class.delete({ where: { id } });
    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.CLASS_DELETE,
      entity: 'Class',
      entityId: id,
    });

    return { message: 'Class deleted successfully', data: null };
  }

  private async assertAcademicYearInSchool(
    academicYearId: string,
    schoolId: string,
  ) {
    const ay = await this.prisma.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
      select: { id: true },
    });
    if (!ay) {
      throw new BadRequestException('Academic year not found in this school');
    }
  }
}
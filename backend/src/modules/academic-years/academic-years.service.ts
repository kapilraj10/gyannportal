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

import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';
import { QueryAcademicYearDto } from './dto/query-academic-year.dto.js';

@Injectable()
export class AcademicYearsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateAcademicYearDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const existing = await this.prisma.academicYear.findFirst({
      where: { schoolId, name: dto.name.trim() },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'Academic year name already exists in this school',
      );
    }

    const academicYear = await this.prisma.$transaction(async (tx) => {
      if (dto.isCurrent) {
        await tx.academicYear.updateMany({
          where: { schoolId, isCurrent: true },
          data: { isCurrent: false },
        });
      }

      return tx.academicYear.create({
        data: {
          schoolId,
          name: dto.name.trim(),
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          isCurrent: dto.isCurrent ?? false,
          status: dto.status,
        },
      });
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.ACADEMIC_YEAR_CREATE,
      entity: 'AcademicYear',
      entityId: academicYear.id,
    });

    return {
      message: 'Academic year created successfully',
      data: academicYear,
    };
  }

  async findAll(user: AuthUser, query: QueryAcademicYearDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AcademicYearWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [total, rows] = await Promise.all([
      this.prisma.academicYear.count({ where }),
      this.prisma.academicYear.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        include: { _count: { select: { classes: true, enrollments: true } } },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.academicYear.findUnique({
      where: { id },
      include: { _count: { select: { classes: true, enrollments: true } } },
    });
    if (!row) {
      throw new NotFoundException('Academic year not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Academic year fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateAcademicYearDto) {
    const row = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Academic year not found');
    }
    assertSameSchool(user, row.schoolId);

    const startDate = dto.startDate ? new Date(dto.startDate) : row.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : row.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.isCurrent) {
        await tx.academicYear.updateMany({
          where: { schoolId: row.schoolId, isCurrent: true, NOT: { id } },
          data: { isCurrent: false },
        });
      }

      return tx.academicYear.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          isCurrent: dto.isCurrent,
          status: dto.status,
        },
      });
    });

    return { message: 'Academic year updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Academic year not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.academicYear.delete({ where: { id } });
    return { message: 'Academic year deleted successfully', data: null };
  }
}
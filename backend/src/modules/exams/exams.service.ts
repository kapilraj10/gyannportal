import {
  BadRequestException,
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

import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';
import { QueryExamDto } from './dto/query-exam.dto.js';

const EXAM_SELECT = {
  id: true,
  schoolId: true,
  name: true,
  description: true,
  academicYearId: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  academicYear: { select: { id: true, name: true } },
  subjects: { select: { id: true, name: true, code: true } },
} satisfies Prisma.ExamSelect;

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateExamDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const ay = await this.prisma.academicYear.findFirst({
      where: { id: dto.academicYearId, schoolId },
      select: { id: true },
    });
    if (!ay) {
      throw new BadRequestException('Academic year not found in school');
    }

    await this.assertSubjectsInSchool(dto.subjectIds, schoolId);

    const created = await this.prisma.exam.create({
      data: {
        schoolId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        academicYearId: dto.academicYearId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status,
        subjects: dto.subjectIds?.length
          ? { connect: dto.subjectIds.map((id) => ({ id })) }
          : undefined,
      },
      select: EXAM_SELECT,
    });

    return { message: 'Exam created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QueryExamDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ExamWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.search) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [total, rows] = await Promise.all([
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: { ...EXAM_SELECT, _count: { select: { results: true } } },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.exam.findUnique({
      where: { id },
      select: EXAM_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Exam not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Exam fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateExamDto) {
    const row = await this.prisma.exam.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Exam not found');
    }
    assertSameSchool(user, row.schoolId);

    if (dto.academicYearId) {
      const ay = await this.prisma.academicYear.findFirst({
        where: { id: dto.academicYearId, schoolId: row.schoolId },
        select: { id: true },
      });
      if (!ay) throw new BadRequestException('Academic year not found in school');
    }

    await this.assertSubjectsInSchool(dto.subjectIds, row.schoolId);

    const updated = await this.prisma.exam.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        academicYearId: dto.academicYearId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
        subjects: dto.subjectIds
          ? { set: dto.subjectIds.map((id) => ({ id })) }
          : undefined,
      },
      select: EXAM_SELECT,
    });

    return { message: 'Exam updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.exam.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Exam not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.exam.delete({ where: { id } });
    return { message: 'Exam deleted successfully', data: null };
  }

  private async assertSubjectsInSchool(
    subjectIds: string[] | undefined,
    schoolId: string,
  ) {
    if (!subjectIds?.length) return;
    const count = await this.prisma.subject.count({
      where: { id: { in: subjectIds }, schoolId },
    });
    if (count !== subjectIds.length) {
      throw new BadRequestException(
        'One or more subjects are not found in this school',
      );
    }
  }
}
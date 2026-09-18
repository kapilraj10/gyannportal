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

import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';
import { QuerySubjectDto } from './dto/query-subject.dto.js';

const SUBJECT_SELECT = {
  id: true,
  schoolId: true,
  name: true,
  code: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SubjectSelect;

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateSubjectDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);
    const code = dto.code.trim().toUpperCase();

    const dup = await this.prisma.subject.findUnique({
      where: { schoolId_code: { schoolId, code } },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException('Subject code already exists in this school');
    }

    const created = await this.prisma.subject.create({
      data: {
        schoolId,
        name: dto.name.trim(),
        code,
        description: dto.description?.trim(),
        status: dto.status,
      },
      select: SUBJECT_SELECT,
    });

    return { message: 'Subject created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QuerySubjectDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.SubjectWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...SUBJECT_SELECT,
          _count: { select: { courses: true, exams: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.subject.findUnique({
      where: { id },
      select: SUBJECT_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Subject not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Subject fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateSubjectDto) {
    const row = await this.prisma.subject.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Subject not found');
    }
    assertSameSchool(user, row.schoolId);

    const updated = await this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        code: dto.code?.trim().toUpperCase(),
        description: dto.description?.trim(),
        status: dto.status,
      },
      select: SUBJECT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.CLASS_UPDATE,
      entity: 'Subject',
      entityId: id,
    });

    return { message: 'Subject updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.subject.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Subject not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Subject deleted successfully', data: null };
  }
}
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

import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';

const COURSE_SELECT = {
  id: true,
  schoolId: true,
  name: true,
  code: true,
  description: true,
  subjectId: true,
  classId: true,
  sectionId: true,
  teacherId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  subject: { select: { id: true, name: true, code: true } },
  class: { select: { id: true, name: true, code: true } },
  section: { select: { id: true, name: true } },
  teacher: {
    select: {
      id: true,
      employeeCode: true,
      user: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.CourseSelect;

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateCourseDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    await this.assertRelations(schoolId, dto);

    const code = dto.code.trim().toUpperCase();
    const dup = await this.prisma.course.findUnique({
      where: { schoolId_code: { schoolId, code } },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException('Course code already exists in this school');
    }

    const created = await this.prisma.course.create({
      data: {
        schoolId,
        name: dto.name.trim(),
        code,
        description: dto.description?.trim(),
        subjectId: dto.subjectId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        teacherId: dto.teacherId,
        status: dto.status,
      },
      select: COURSE_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.CLASS_CREATE,
      entity: 'Course',
      entityId: created.id,
      metadata: { code },
    });

    return { message: 'Course created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QueryCourseDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CourseWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.classId) where.classId = query.classId;
    if (query.teacherId) where.teacherId = query.teacherId;

    // Teachers only see their own courses unless they are admins.
    if (user.role === Role.TEACHER) {
      where.teacher = { userId: user.userId };
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...COURSE_SELECT,
          _count: { select: { assignments: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.course.findUnique({
      where: { id },
      select: COURSE_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Course not found');
    }
    assertSameSchool(user, row.schoolId);
    if (user.role === Role.TEACHER && row.teacher.user.id !== user.userId) {
      throw new NotFoundException('Course not found');
    }
    return { message: 'Course fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateCourseDto) {
    const row = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Course not found');
    }
    assertSameSchool(user, row.schoolId);

    if (dto.subjectId || dto.teacherId || dto.classId || dto.sectionId) {
      await this.assertRelations(row.schoolId, dto);
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        code: dto.code?.trim().toUpperCase(),
        description: dto.description?.trim(),
        subjectId: dto.subjectId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        teacherId: dto.teacherId,
        status: dto.status,
      },
      select: COURSE_SELECT,
    });

    return { message: 'Course updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Course not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully', data: null };
  }

  private async assertRelations(
    schoolId: string,
    dto: CreateCourseDto | UpdateCourseDto,
  ) {
    if (dto.subjectId) {
      const subj = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, schoolId },
        select: { id: true },
      });
      if (!subj) throw new BadRequestException('Subject not found in school');
    }
    if (dto.teacherId) {
      const t = await this.prisma.teacher.findFirst({
        where: { id: dto.teacherId, schoolId },
        select: { id: true },
      });
      if (!t) throw new BadRequestException('Teacher not found in school');
    }
    if (dto.classId) {
      const c = await this.prisma.class.findFirst({
        where: { id: dto.classId, schoolId },
        select: { id: true },
      });
      if (!c) throw new BadRequestException('Class not found in school');
    }
    if (dto.sectionId) {
      const s = await this.prisma.section.findFirst({
        where: { id: dto.sectionId, schoolId },
        select: { id: true },
      });
      if (!s) throw new BadRequestException('Section not found in school');
    }
  }
}
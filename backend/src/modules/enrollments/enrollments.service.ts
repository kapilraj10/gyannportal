import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { EnrollmentStatus } from '../../generated/prisma/client.js';
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

import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { BulkEnrollDto } from './dto/bulk-enroll.dto.js';
import { QueryEnrollmentDto } from './dto/query-enrollment.dto.js';

const ENROLLMENT_SELECT = {
  id: true,
  schoolId: true,
  studentId: true,
  classId: true,
  sectionId: true,
  academicYearId: true,
  enrolledAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      studentCode: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  class: { select: { id: true, name: true, code: true } },
  section: { select: { id: true, name: true } },
  academicYear: { select: { id: true, name: true } },
} satisfies Prisma.EnrollmentSelect;

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateEnrollmentDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    await this.assertReference(schoolId, {
      studentId: dto.studentId,
      classId: dto.classId,
      sectionId: dto.sectionId,
      academicYearId: dto.academicYearId,
    });

    const dup = await this.prisma.enrollment.findUnique({
      where: {
        studentId_classId_academicYearId: {
          studentId: dto.studentId,
          classId: dto.classId,
          academicYearId: dto.academicYearId,
        },
      },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException(
        'Student is already enrolled in this class for the academic year',
      );
    }

    const created = await this.prisma.enrollment.create({
      data: {
        schoolId,
        studentId: dto.studentId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        academicYearId: dto.academicYearId,
        status: dto.status ?? EnrollmentStatus.ACTIVE,
      },
      select: ENROLLMENT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.ENROLLMENT_CREATE,
      entity: 'Enrollment',
      entityId: created.id,
      metadata: { studentId: dto.studentId, classId: dto.classId },
    });

    return { message: 'Enrollment created successfully', data: created };
  }

  async bulkCreate(user: AuthUser, dto: BulkEnrollDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);
    const classId = dto.classId;

    await this.assertReference(schoolId, {
      classId,
      sectionId: dto.sectionId,
      academicYearId: dto.academicYearId,
    });

    const studentCount = await this.prisma.student.count({
      where: { id: { in: dto.studentIds }, schoolId },
    });
    if (studentCount !== dto.studentIds.length) {
      throw new BadRequestException(
        'One or more students are not found in this school',
      );
    }

    const existing = await this.prisma.enrollment.findMany({
      where: {
        studentId: { in: dto.studentIds },
        classId,
        academicYearId: dto.academicYearId,
      },
      select: { studentId: true },
    });
    const existingIds = new Set(existing.map((e) => e.studentId));

    const toCreate = dto.studentIds.filter((id) => !existingIds.has(id));

    if (toCreate.length) {
      await this.prisma.enrollment.createMany({
        data: toCreate.map((studentId) => ({
          schoolId,
          studentId,
          classId,
          sectionId: dto.sectionId,
          academicYearId: dto.academicYearId,
          status: dto.status ?? EnrollmentStatus.ACTIVE,
        })),
        skipDuplicates: true,
      });
    }

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.ENROLLMENT_CREATE,
      entity: 'Enrollment',
      entityId: classId,
      metadata: { created: toCreate.length, attempted: dto.studentIds.length },
    });

    return {
      message: 'Bulk enrollment completed',
      data: { attempted: dto.studentIds.length, created: toCreate.length },
    };
  }

  async findAll(user: AuthUser, query: QueryEnrollmentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.EnrollmentWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.studentId) where.studentId = query.studentId;
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.academicYearId) where.academicYearId = query.academicYearId;

    if (user.role === Role.TEACHER) {
      where.class = {
        teacherClasses: { some: { teacher: { userId: user.userId } } },
      };
    }

    const [total, rows] = await Promise.all([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.findMany({
        where,
        orderBy: { enrolledAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: ENROLLMENT_SELECT,
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.enrollment.findUnique({
      where: { id },
      select: ENROLLMENT_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Enrollment not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Enrollment fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateEnrollmentDto) {
    const row = await this.prisma.enrollment.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Enrollment not found');
    }
    assertSameSchool(user, row.schoolId);

    const updated = await this.prisma.enrollment.update({
      where: { id },
      data: {
        classId: dto.classId,
        sectionId: dto.sectionId,
        academicYearId: dto.academicYearId,
        status: dto.status,
      },
      select: ENROLLMENT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.ENROLLMENT_UPDATE,
      entity: 'Enrollment',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Enrollment updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.enrollment.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Enrollment not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.enrollment.delete({ where: { id } });
    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.ENROLLMENT_DELETE,
      entity: 'Enrollment',
      entityId: id,
    });

    return { message: 'Enrollment deleted successfully', data: null };
  }

  private async assertReference(
    schoolId: string,
    ref: Partial<{
      studentId: string;
      classId: string;
      sectionId?: string;
      academicYearId?: string;
    }>,
  ) {
    if (ref.studentId) {
      const s = await this.prisma.student.findFirst({
        where: { id: ref.studentId, schoolId },
        select: { id: true },
      });
      if (!s) throw new BadRequestException('Student not found in school');
    }
    if (ref.classId) {
      const c = await this.prisma.class.findFirst({
        where: { id: ref.classId, schoolId },
        select: { id: true },
      });
      if (!c) throw new BadRequestException('Class not found in school');
    }
    if (ref.sectionId) {
      const s = await this.prisma.section.findFirst({
        where: {
          id: ref.sectionId,
          schoolId,
          ...(ref.classId ? { classId: ref.classId } : {}),
        },
        select: { id: true },
      });
      if (!s)
        throw new BadRequestException(
          'Section not found in school (or class)',
        );
    }
    if (ref.academicYearId) {
      const ay = await this.prisma.academicYear.findFirst({
        where: { id: ref.academicYearId, schoolId },
        select: { id: true },
      });
      if (!ay) throw new BadRequestException('Academic year not found in school');
    }
  }
}
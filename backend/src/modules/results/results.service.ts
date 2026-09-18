import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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

import { CreateResultDto } from './dto/create-result.dto.js';
import { UpdateResultDto } from './dto/update-result.dto.js';
import { BulkCreateResultDto } from './dto/bulk-create-result.dto.js';
import { QueryResultDto } from './dto/query-result.dto.js';

const RESULT_SELECT = {
  id: true,
  schoolId: true,
  studentId: true,
  examId: true,
  subjectId: true,
  teacherId: true,
  marks: true,
  grade: true,
  remarks: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      studentCode: true,
      user: { select: { id: true, name: true } },
    },
  },
  exam: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
} satisfies Prisma.ResultSelect;

@Injectable()
export class ResultsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  private async resolveTeacherId(
    user: AuthUser,
    teacherId: string | undefined,
    schoolId: string,
  ) {
    let resolved = teacherId;

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { schoolId, userId: user.userId },
        select: { id: true },
      });
      resolved = teacher?.id;
    }

    if (!resolved) {
      return null;
    }

    const teacher = await this.prisma.teacher.findFirst({
      where: { id: resolved, schoolId },
      select: { id: true },
    });
    if (!teacher) {
      throw new BadRequestException('Teacher not found in school');
    }
    return resolved;
  }

  async create(user: AuthUser, dto: CreateResultDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    await this.assertExamSubject(dto.examId, dto.subjectId, schoolId);
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
      select: { id: true },
    });
    if (!student) {
      throw new BadRequestException('Student not found in school');
    }

    const teacherId = await this.resolveTeacherId(user, dto.teacherId, schoolId);

    const dup = await this.prisma.result.findUnique({
      where: {
        studentId_examId_subjectId: {
          studentId: dto.studentId,
          examId: dto.examId,
          subjectId: dto.subjectId,
        },
      },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException('Result already exists for this student/exam/subject');
    }

    const created = await this.prisma.result.create({
      data: {
        schoolId,
        studentId: dto.studentId,
        examId: dto.examId,
        subjectId: dto.subjectId,
        teacherId: teacherId ?? undefined,
        marks: dto.marks,
        grade: dto.grade,
        remarks: dto.remarks,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
      select: RESULT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.RESULT_CREATE,
      entity: 'Result',
      entityId: created.id,
      metadata: { studentId: dto.studentId, examId: dto.examId },
    });

    return { message: 'Result created successfully', data: created };
  }

  async bulkCreate(user: AuthUser, dto: BulkCreateResultDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    await this.assertExamSubject(dto.examId, dto.subjectId, schoolId);

    const studentIds = dto.records.map((r) => r.studentId);
    const studentCount = await this.prisma.student.count({
      where: { id: { in: studentIds }, schoolId },
    });
    if (studentCount !== studentIds.length) {
      throw new BadRequestException(
        'One or more students are not found in this school',
      );
    }

    const teacherId = await this.resolveTeacherId(user, dto.teacherId, schoolId);

    const existing = await this.prisma.result.findMany({
      where: {
        studentId: { in: studentIds },
        examId: dto.examId,
        subjectId: dto.subjectId,
      },
      select: { studentId: true },
    });

    const publishedAt = new Date();
    const existingIds = new Set(existing.map((e) => e.studentId));
    const toUpsert = dto.records.filter(
      (r) => existingIds.has(r.studentId),
    );
    const toCreate = dto.records.filter(
      (r) => !existingIds.has(r.studentId),
    );

    if (toCreate.length) {
      await this.prisma.result.createMany({
        data: toCreate.map((r) => ({
          schoolId,
          studentId: r.studentId,
          examId: dto.examId,
          subjectId: dto.subjectId,
          teacherId: teacherId ?? undefined,
          marks: r.marks,
          grade: r.grade,
          remarks: r.remarks,
          publishedAt: null,
        })),
        skipDuplicates: true,
      });
    }

    for (const r of toUpsert) {
      await this.prisma.result.updateMany({
        where: {
          studentId: r.studentId,
          examId: dto.examId,
          subjectId: dto.subjectId,
        },
        data: { marks: r.marks, grade: r.grade, remarks: r.remarks },
      });
    }

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.RESULT_CREATE,
      entity: 'Result',
      entityId: dto.examId,
      metadata: { created: toCreate.length, updated: toUpsert.length },
    });

    return {
      message: 'Results recorded successfully',
      data: { created: toCreate.length, updated: toUpsert.length },
    };
  }

  async findAll(user: AuthUser, query: QueryResultDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ResultWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.examId) where.examId = query.examId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.studentId) where.studentId = query.studentId;

    const studentWhere: Prisma.StudentWhereInput = {};
    if (query.classId) {
      studentWhere.enrollments = { some: { classId: query.classId } };
    }
    if (user.role === Role.STUDENT) {
      studentWhere.userId = user.userId;
    } else if (user.role === Role.PARENT) {
      studentWhere.parentStudents = {
        some: { parent: { userId: user.userId } },
      };
    } else if (user.role === Role.TEACHER) {
      where.teacher = { userId: user.userId };
    }
    if (Object.keys(studentWhere).length) {
      where.student = studentWhere;
    }

    const [total, rows] = await Promise.all([
      this.prisma.result.count({ where }),
      this.prisma.result.findMany({
        where,
        orderBy: [{ exam: { startDate: 'desc' } }, { createdAt: 'desc' }],
        skip: getSkip(page, limit),
        take: limit,
        select: RESULT_SELECT,
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.result.findUnique({
      where: { id },
      select: RESULT_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Result not found');
    }
    assertSameSchool(user, row.schoolId);

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { id: row.studentId },
        select: { userId: true },
      });
      if (student?.userId !== user.userId) {
        throw new ForbiddenException('You can only view your own results');
      }
    }

    if (user.role === Role.PARENT) {
      const link = await this.prisma.parentStudent.findFirst({
        where: {
          studentId: row.studentId,
          parent: { userId: user.userId },
        },
        select: { id: true },
      });
      if (!link) {
        throw new ForbiddenException(
          'You can only view your own children results',
        );
      }
    }

    if (user.role === Role.TEACHER) {
      const teacherId = await this.resolveTeacherId(user, undefined, row.schoolId);
      if (!teacherId || row.teacherId !== teacherId) {
        throw new ForbiddenException('You can only view results you authored');
      }
    }

    return { message: 'Result fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateResultDto) {
    const row = await this.prisma.result.findUnique({
      where: { id },
      select: { id: true, schoolId: true, teacherId: true },
    });
    if (!row) {
      throw new NotFoundException('Result not found');
    }
    assertSameSchool(user, row.schoolId);

    if (user.role === Role.TEACHER) {
      const teacherId = await this.resolveTeacherId(user, undefined, row.schoolId);
      if (!teacherId || row.teacherId !== teacherId) {
        throw new ForbiddenException('You can only update results you authored');
      }
    }

    const updated = await this.prisma.result.update({
      where: { id },
      data: {
        marks: dto.marks,
        grade: dto.grade,
        remarks: dto.remarks,
        teacherId: dto.teacherId,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
      select: RESULT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.RESULT_UPDATE,
      entity: 'Result',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Result updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.result.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Result not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.result.delete({ where: { id } });
    return { message: 'Result deleted successfully', data: null };
  }

  private async assertExamSubject(
    examId: string,
    subjectId: string,
    schoolId: string,
  ) {
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, schoolId },
      select: { id: true },
    });
    if (!exam) {
      throw new BadRequestException('Exam not found in school');
    }
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      select: { id: true },
    });
    if (!subject) {
      throw new BadRequestException('Subject not found in school');
    }
  }
}
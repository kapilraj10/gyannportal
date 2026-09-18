import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { AttendanceStatus } from '../../generated/prisma/client.js';
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

import { MarkAttendanceDto } from './dto/mark-attendance.dto.js';
import { QueryAttendanceDto } from './dto/query-attendance.dto.js';

const ATTENDANCE_SELECT = {
  id: true,
  schoolId: true,
  studentId: true,
  classId: true,
  sectionId: true,
  date: true,
  status: true,
  markedBy: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      studentCode: true,
      user: { select: { id: true, name: true } },
    },
  },
  class: { select: { id: true, name: true } },
} satisfies Prisma.AttendanceSelect;

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async mark(user: AuthUser, dto: MarkAttendanceDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);
    if (!dto.records.length) {
      throw new BadRequestException('records must not be empty');
    }

    const cls = await this.prisma.class.findFirst({
      where: { id: dto.classId, schoolId },
      select: { id: true },
    });
    if (!cls) {
      throw new BadRequestException('Class not found in school');
    }

    if (user.role === Role.TEACHER) {
      const teacherId = await this.getTeacherId(user, schoolId);
      const teacherClass = await this.prisma.teacherClass.findFirst({
        where: {
          teacherId,
          classId: dto.classId,
          schoolId,
          ...(dto.sectionId ? { sectionId: dto.sectionId } : {}),
        },
        select: { id: true },
      });
      if (!teacherClass) {
        throw new ForbiddenException(
          'You are not assigned to this class/section',
        );
      }
    }

    const studentIds = dto.records.map((r) => r.studentId);
    const studentCount = await this.prisma.student.count({
      where: { id: { in: studentIds }, schoolId },
    });
    if (studentCount !== studentIds.length) {
      throw new BadRequestException(
        'One or more students are not found in this school',
      );
    }

    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const results = await this.prisma.$transaction(
      dto.records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: record.studentId,
              classId: dto.classId,
              date,
            },
          },
          update: {
            status: record.status ?? AttendanceStatus.PRESENT,
            sectionId: dto.sectionId,
            markedBy: user.userId,
          },
          create: {
            schoolId,
            studentId: record.studentId,
            classId: dto.classId,
            sectionId: dto.sectionId,
            date,
            status: record.status ?? AttendanceStatus.PRESENT,
            markedBy: user.userId,
          },
          select: ATTENDANCE_SELECT,
        }),
      ),
    );

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.ATTENDANCE_CREATE,
      entity: 'Attendance',
      entityId: results[0]?.id ?? dto.classId,
      metadata: {
        classId: dto.classId,
        date: date.toISOString(),
        count: results.length,
      },
    });

    return {
      message: 'Attendance recorded successfully',
      data: results,
    };
  }

  async findAll(user: AuthUser, query: QueryAttendanceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AttendanceWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.studentId) where.studentId = query.studentId;
    if (query.from || query.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.from) dateFilter.gte = new Date(query.from);
      if (query.to) dateFilter.lte = new Date(query.to);
      where.date = dateFilter;
    }

    if (user.role === Role.TEACHER) {
      where.class = {
        teacherClasses: { some: { teacher: { userId: user.userId } } },
      };
    }

    const [total, rows] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: ATTENDANCE_SELECT,
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.attendance.findUnique({
      where: { id },
      select: ATTENDANCE_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Attendance record not found');
    }
    assertSameSchool(user, row.schoolId);

    if (user.role === Role.TEACHER) {
      const teacherId = await this.getTeacherId(user, row.schoolId);
      const teacherClass = await this.prisma.teacherClass.findFirst({
        where: {
          teacherId,
          classId: row.classId,
          schoolId: row.schoolId,
          ...(row.sectionId ? { sectionId: row.sectionId } : {}),
        },
        select: { id: true },
      });
      if (!teacherClass) {
        throw new ForbiddenException(
          'You are not assigned to this class/section',
        );
      }
    }

    return { message: 'Attendance record fetched successfully', data: row };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.attendance.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!row) {
      throw new NotFoundException('Attendance record not found');
    }
    assertSameSchool(user, row.schoolId);

    await this.prisma.attendance.delete({ where: { id } });
    return { message: 'Attendance record deleted successfully', data: null };
  }

  async summary(
    user: AuthUser,
    query: { classId?: string; sectionId?: string; from?: string; to?: string },
  ) {
    const where: Prisma.AttendanceWhereInput = {};
    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.from || query.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.from) dateFilter.gte = new Date(query.from);
      if (query.to) dateFilter.lte = new Date(query.to);
      where.date = dateFilter;
    }

    if (user.role === Role.TEACHER) {
      where.class = {
        teacherClasses: { some: { teacher: { userId: user.userId } } },
      };
    }

    const grouped = await this.prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const data: Record<string, number> = {};
    for (const g of grouped) {
      data[g.status] = g._count._all;
    }

    return {
      message: 'Attendance summary fetched successfully',
      data,
    };
  }

  private async getTeacherId(user: AuthUser, schoolId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { schoolId, userId: user.userId },
      select: { id: true },
    });

    if (!teacher) {
      throw new ForbiddenException('Teacher profile not found');
    }

    return teacher.id;
  }
}
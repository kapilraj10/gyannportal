import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

import { Prisma } from '../../generated/prisma/client.js';
import { ParentStatus, UserStatus } from '../../generated/prisma/client.js';
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

import { CreateParentDto } from './dto/create-parent.dto.js';
import { UpdateParentDto } from './dto/update-parent.dto.js';
import { QueryParentDto } from './dto/query-parent.dto.js';
import { QueryAttendanceDto } from '../attendance/dto/query-attendance.dto.js';
import { QueryAssignmentDto } from '../assignments/dto/query-assignment.dto.js';
import { QueryExamDto } from '../exams/dto/query-exam.dto.js';
import { QueryResultDto } from '../results/dto/query-result.dto.js';
import { QueryNotificationDto } from '../notifications/dto/query-notification.dto.js';

const PARENT_SELECT = {
  id: true,
  userId: true,
  schoolId: true,
  occupation: true,
  address: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      gender: true,
      branchId: true,
    },
  },
} satisfies Prisma.ParentSelect;

@Injectable()
export class ParentsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateParentDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    if (dto.userId && (dto.name || dto.email || dto.password)) {
      throw new BadRequestException(
        'Use either an existing userId OR new user credentials, not both',
      );
    }

    if (dto.children?.length) {
      await this.assertStudentsInSchool(
        dto.children.map((c) => c.studentId),
        schoolId,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let userId = dto.userId;

      if (userId) {
        const existingUser = await tx.user.findFirst({
          where: { id: userId, schoolId },
          include: { parentProfile: { select: { id: true } } },
        });
        if (!existingUser) {
          throw new NotFoundException('User not found in this school');
        }
        if (existingUser.parentProfile) {
          throw new ConflictException('User is already a parent');
        }
        userId = existingUser.id;
      } else {
        if (!dto.name || !dto.email || !dto.password) {
          throw new BadRequestException(
            'name, email and password are required when creating a new account',
          );
        }
        const email = dto.email.trim().toLowerCase();
        const dup = await tx.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (dup) {
          throw new ConflictException('Email already exists');
        }

        const role = await tx.role.findUnique({
          where: { name: Role.PARENT },
          select: { id: true },
        });

        const created = await tx.user.create({
          data: {
            schoolId,
            branchId: dto.branchId,
            name: dto.name.trim(),
            email,
            phone: dto.phone?.trim(),
            passwordHash: await bcrypt.hash(dto.password, 12),
            gender: dto.gender,
            status: UserStatus.ACTIVE,
            roleId: role!.id,
          },
          select: { id: true },
        });
        userId = created.id;
      }

      const parent = await tx.parent.create({
        data: {
          userId,
          schoolId,
          occupation: dto.occupation?.trim(),
          address: dto.address?.trim(),
          status: dto.status ?? ParentStatus.ACTIVE,
          parentStudents: dto.children?.length
            ? {
                create: dto.children.map((c) => ({
                  studentId: c.studentId,
                  relationship: c.relationship,
                  isPrimary: c.isPrimary,
                })),
              }
            : undefined,
        },
        select: PARENT_SELECT,
      });

      return parent;
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.PARENT_CREATE,
      entity: 'Parent',
      entityId: result.id,
      metadata: { childCount: dto.children?.length ?? 0 },
    });

    return { message: 'Parent created successfully', data: result };
  }

  async findAll(user: AuthUser, query: QueryParentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ParentWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.parent.count({ where }),
      this.prisma.parent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...PARENT_SELECT,
          _count: { select: { parentStudents: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      select: {
        ...PARENT_SELECT,
        _count: { select: { parentStudents: true } },
        parentStudents: {
          select: {
            relationship: true,
            isPrimary: true,
            student: {
              select: {
                id: true,
                studentCode: true,
                status: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });
    if (!parent) {
      throw new NotFoundException('Parent not found');
    }
    assertSameSchool(user, parent.schoolId);
    return { message: 'Parent fetched successfully', data: parent };
  }

  async update(user: AuthUser, id: string, dto: UpdateParentDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    });
    if (!parent) {
      throw new NotFoundException('Parent not found');
    }
    assertSameSchool(user, parent.schoolId);

    if (dto.userId || dto.email || dto.password || dto.schoolId) {
      throw new BadRequestException(
        'Credential and linkage fields cannot be changed here',
      );
    }

    if (dto.children?.length) {
      await this.assertStudentsInSchool(
        dto.children.map((c) => c.studentId),
        parent.schoolId,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.parent.update({
        where: { id },
        data: {
          occupation: dto.occupation?.trim(),
          address: dto.address?.trim(),
          status: dto.status,
          ...(dto.children
            ? {
                parentStudents: {
                  deleteMany: {},
                  create: dto.children.map((c) => ({
                    studentId: c.studentId,
                    relationship: c.relationship,
                    isPrimary: c.isPrimary,
                  })),
                },
              }
            : {}),
        },
        select: PARENT_SELECT,
      });

      if (dto.name || dto.phone || dto.gender) {
        await tx.user.update({
          where: { id: parent.userId },
          data: {
            name: dto.name?.trim(),
            phone: dto.phone?.trim(),
            gender: dto.gender,
          },
        });
      }

      return profile;
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: parent.schoolId,
      action: AuditAction.PARENT_UPDATE,
      entity: 'Parent',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Parent updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    });
    if (!parent) {
      throw new NotFoundException('Parent not found');
    }
    assertSameSchool(user, parent.schoolId);

    await this.prisma.$transaction([
      this.prisma.parent.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: parent.userId } }),
    ]);

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: parent.schoolId,
      action: AuditAction.PARENT_DELETE,
      entity: 'Parent',
      entityId: id,
    });

    return { message: 'Parent deleted successfully', data: null };
  }

  private async assertStudentsInSchool(studentIds: string[], schoolId: string) {
    if (!studentIds.length) return;
    const count = await this.prisma.student.count({
      where: { id: { in: studentIds }, schoolId },
    });
    if (count !== studentIds.length) {
      throw new BadRequestException(
        'One or more students are not found in this school',
      );
    }
  }

  // =====================================================
  // PARENT PORTAL - CHILDREN DATA ACCESS
  // =====================================================

  private async getMyChildrenIds(user: AuthUser): Promise<string[]> {
    const parent = await this.prisma.parent.findUnique({
      where: { userId: user.userId },
      select: { id: true, parentStudents: { select: { studentId: true } } },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }
    return parent.parentStudents.map((ps) => ps.studentId);
  }

  async getMyChildren(user: AuthUser) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.length) {
      return { message: 'Children fetched successfully', data: [] };
    }

    const children = await this.prisma.student.findMany({
      where: { id: { in: childIds }, schoolId: user.schoolId },
      select: {
        id: true,
        studentCode: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        admissionDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        _count: { select: { enrollments: true, parentStudents: true } },
        enrollments: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            classId: true,
            sectionId: true,
            academicYearId: true,
            status: true,
            class: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
            academicYear: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return { message: 'Children fetched successfully', data: children };
  }

  async getChildProfile(user: AuthUser, studentId: string) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('You do not have access to this student');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId, schoolId: user.schoolId },
      select: {
        id: true,
        studentCode: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        admissionDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            gender: true,
            aboutMe: true,
            city: true,
            country: true,
          },
        },
        parentStudents: {
          select: {
            relationship: true,
            isPrimary: true,
            parent: {
              select: {
                id: true,
                user: {
                  select: { id: true, name: true, email: true, phone: true },
                },
              },
            },
          },
        },
        enrollments: {
          select: {
            id: true,
            classId: true,
            sectionId: true,
            academicYearId: true,
            status: true,
            class: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
            academicYear: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return { message: 'Child profile fetched successfully', data: student };
  }

  async getChildAttendance(
    user: AuthUser,
    studentId: string,
    query: QueryAttendanceDto,
  ) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('You do not have access to this student');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AttendanceWhereInput = {
      studentId,
      schoolId: user.schoolId,
    };

    if (query.status) where.status = query.status;
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.from || query.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.from) dateFilter.gte = new Date(query.from);
      if (query.to) dateFilter.lte = new Date(query.to);
      where.date = dateFilter;
    }

    const [total, rows] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
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
          class: { select: { id: true, name: true, code: true } },
          section: { select: { id: true, name: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async getChildAssignments(
    user: AuthUser,
    studentId: string,
    query: QueryAssignmentDto,
  ) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('You do not have access to this student');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId, schoolId: user.schoolId },
      select: { enrollments: { select: { classId: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrolledClassIds = student.enrollments.map((e) => e.classId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AssignmentWhereInput = {
      schoolId: user.schoolId,
      classId: { in: enrolledClassIds },
      status: { not: 'DRAFT' },
    };

    if (query.status) where.status = query.status;
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.courseId) where.courseId = query.courseId;
    if (query.search) {
      where.title = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [total, rows] = await Promise.all([
      this.prisma.assignment.count({ where }),
      this.prisma.assignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          id: true,
          schoolId: true,
          classId: true,
          sectionId: true,
          subjectId: true,
          courseId: true,
          teacherId: true,
          title: true,
          description: true,
          dueDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
          teacher: {
            select: { id: true, user: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async getChildExams(user: AuthUser, studentId: string, query: QueryExamDto) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('You do not have access to this student');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId, schoolId: user.schoolId },
      select: { enrollments: { select: { classId: true, academicYearId: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrolledClassIds = student.enrollments.map((e) => e.classId);
    const academicYearIds = student.enrollments.map((e) => e.academicYearId).filter(Boolean) as string[];

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ExamWhereInput = {
      schoolId: user.schoolId,
      academicYearId: { in: academicYearIds },
    };

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
        select: {
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
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async getChildResults(user: AuthUser, studentId: string, query: QueryResultDto) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('You do not have access to this student');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ResultWhereInput = {
      studentId,
      schoolId: user.schoolId,
    };

    if (query.examId) where.examId = query.examId;
    if (query.subjectId) where.subjectId = query.subjectId;

    const [total, rows] = await Promise.all([
      this.prisma.result.count({ where }),
      this.prisma.result.findMany({
        where,
        orderBy: [{ exam: { startDate: 'desc' } }, { createdAt: 'desc' }],
        skip: getSkip(page, limit),
        take: limit,
        select: {
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
          exam: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async getChildNotifications(
    user: AuthUser,
    studentId: string,
    query: QueryNotificationDto,
  ) {
    const childIds = await this.getMyChildrenIds(user);
    if (!childIds.includes(studentId)) {
      throw new ForbiddenException('You do not have access to this student');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId, schoolId: user.schoolId },
      select: { userId: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = {
      recipientId: student.userId,
    };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const [total, rows] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          id: true,
          schoolId: true,
          senderId: true,
          recipientId: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true,
          sender: { select: { id: true, name: true } },
        },
      }),
    ]);

    const unread = await this.prisma.notification.count({
      where: { recipientId: student.userId, isRead: false },
    });

    return { ...paginate(rows, total, page, limit), unread };
  }

  // =====================================================
  // PARENT DASHBOARD
  // =====================================================

  async getDashboard(user: AuthUser) {
    const childIds = await this.getMyChildrenIds(user);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const [
      children,
      totalAssignments,
      pendingAssignments,
      upcomingExams,
      recentResults,
      attendanceToday,
    ] = await Promise.all([
      this.prisma.student.findMany({
        where: { id: { in: childIds }, schoolId: user.schoolId },
        select: {
          id: true,
          studentCode: true,
          status: true,
          user: { select: { id: true, name: true, avatar: true } },
          enrollments: {
            where: { status: 'ACTIVE' },
            select: {
              class: { select: { id: true, name: true, code: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.assignment.count({
        where: {
          schoolId: user.schoolId,
          class: { enrollments: { some: { studentId: { in: childIds } } } },
          status: 'PUBLISHED',
        },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          studentId: { in: childIds },
          status: { in: ['SUBMITTED', 'LATE'] },
        },
      }),
      this.prisma.exam.findMany({
        where: {
          schoolId: user.schoolId,
          startDate: { gte: new Date() },
          status: { in: ['SCHEDULED', 'ONGOING'] },
          academicYear: {
            enrollments: { some: { studentId: { in: childIds } } },
          },
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          status: true,
          academicYear: { select: { name: true } },
        },
        take: 5,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.result.findMany({
        where: {
          studentId: { in: childIds },
          schoolId: user.schoolId,
        },
        select: {
          id: true,
          marks: true,
          grade: true,
          publishedAt: true,
          studentId: true,
          exam: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } },
          student: { select: { id: true, user: { select: { name: true } } } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendance.count({
        where: {
          schoolId: user.schoolId,
          studentId: { in: childIds },
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
    ]);

    // Get unread notifications for children
    const childrenUserIds = await this.prisma.student.findMany({
      where: { id: { in: childIds } },
      select: { userId: true },
    });
    const childUserIds = childrenUserIds.map((c) => c.userId);

    const unreadForChildren = await this.prisma.notification.count({
      where: { recipientId: { in: childUserIds }, isRead: false },
    });

    return {
      message: 'Parent dashboard fetched successfully',
      data: {
        children,
        counts: {
          totalChildren: children.length,
          totalAssignments,
          pendingAssignments,
          upcomingExams: upcomingExams.length,
        },
        upcomingExams,
        recentResults,
        today: { attendance: attendanceToday },
        unreadNotifications: unreadForChildren,
      },
    };
  }
}
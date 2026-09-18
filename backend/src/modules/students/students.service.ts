import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

import { Prisma } from '../../generated/prisma/client.js';
import { UserStatus } from '../../generated/prisma/client.js';
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

import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { QueryStudentDto } from './dto/query-student.dto.js';
import { QueryAttendanceDto } from '../attendance/dto/query-attendance.dto.js';
import { QueryAssignmentDto } from '../assignments/dto/query-assignment.dto.js';
import { QueryExamDto } from '../exams/dto/query-exam.dto.js';
import { QueryResultDto } from '../results/dto/query-result.dto.js';
import { QueryNotificationDto } from '../notifications/dto/query-notification.dto.js';

const STUDENT_SELECT = {
  id: true,
  userId: true,
  schoolId: true,
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
      branchId: true,
      branch: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.StudentSelect;

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateStudentDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    if (dto.userId && (dto.name || dto.email || dto.password)) {
      throw new BadRequestException(
        'Use either an existing userId OR new user credentials, not both',
      );
    }

    if (dto.branchId) {
      await this.assertBranchInSchool(dto.branchId, schoolId);
    }
    if (dto.parentId) {
      await this.assertParentInSchool(dto.parentId, schoolId);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let userId = dto.userId;

      if (userId) {
        const existingUser = await tx.user.findFirst({
          where: { id: userId, schoolId },
          include: { studentProfile: { select: { id: true } } },
        });
        if (!existingUser) {
          throw new NotFoundException('User not found in this school');
        }
        if (existingUser.studentProfile) {
          throw new ConflictException('User is already a student');
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
          where: { name: Role.STUDENT },
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
            avatar: dto.avatar,
            status: UserStatus.ACTIVE,
            roleId: role!.id,
          },
          select: { id: true },
        });
        userId = created.id;
      }

      const studentCode =
        dto.studentCode?.trim() ||
        `STU-${schoolId.slice(0, 6).toUpperCase()}-${Date.now().toString(36)}`;

      const student = await tx.student.create({
        data: {
          userId,
          schoolId,
          studentCode,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          address: dto.address?.trim(),
          admissionDate: dto.admissionDate
            ? new Date(dto.admissionDate)
            : undefined,
          status: dto.status,
        },
        select: STUDENT_SELECT,
      });

      if (dto.parentId) {
        await tx.parentStudent.create({
          data: { parentId: dto.parentId, studentId: student.id },
        });
      }

      return student;
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.STUDENT_CREATE,
      entity: 'Student',
      entityId: result.id,
      metadata: { studentCode: result.studentCode },
    });

    return { message: 'Student created successfully', data: result };
  }

  async findAll(user: AuthUser, query: QueryStudentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.StudentWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.classId) where.enrollments = { some: { classId: query.classId } };
    if (query.sectionId) {
      where.enrollments = { some: { sectionId: query.sectionId } };
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { studentCode: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...STUDENT_SELECT,
          _count: { select: { enrollments: true, parentStudents: true } },
          enrollments: {
            select: {
              id: true,
              class: { select: { id: true, name: true, code: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        ...STUDENT_SELECT,
        _count: { select: { enrollments: true, parentStudents: true } },
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
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    assertSameSchool(user, student.schoolId);
    return { message: 'Student fetched successfully', data: student };
  }

  async update(user: AuthUser, id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    assertSameSchool(user, student.schoolId);

    if (dto.userId || dto.email || dto.password || dto.schoolId) {
      throw new BadRequestException(
        'Credential and linkage fields cannot be changed here',
      );
    }

    if (dto.studentCode) {
      const dup = await this.prisma.student.findFirst({
        where: {
          schoolId: student.schoolId,
          studentCode: dto.studentCode.trim(),
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new ConflictException('Student code already exists');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.student.update({
        where: { id },
        data: {
          studentCode: dto.studentCode?.trim(),
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          address: dto.address?.trim(),
          admissionDate: dto.admissionDate
            ? new Date(dto.admissionDate)
            : undefined,
          status: dto.status,
        },
        select: STUDENT_SELECT,
      });

      if (dto.name || dto.phone || dto.avatar) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            name: dto.name?.trim(),
            phone: dto.phone?.trim(),
            avatar: dto.avatar,
          },
        });
      }

      return profile;
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: student.schoolId,
      action: AuditAction.STUDENT_UPDATE,
      entity: 'Student',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Student updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    assertSameSchool(user, student.schoolId);

    await this.prisma.$transaction([
      this.prisma.student.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: student.userId } }),
    ]);

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: student.schoolId,
      action: AuditAction.STUDENT_DELETE,
      entity: 'Student',
      entityId: id,
    });

    return { message: 'Student deleted successfully', data: null };
  }

  private async assertBranchInSchool(branchId: string, schoolId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, schoolId },
      select: { id: true },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found in this school');
    }
  }

  private async assertParentInSchool(parentId: string, schoolId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      select: { id: true },
    });
    if (!parent) {
      throw new BadRequestException('Parent not found in this school');
    }
  }

  // =====================================================
  // STUDENT PORTAL - MY DATA ACCESS
  // =====================================================

  private async getMyStudentId(user: AuthUser): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }
    return student.id;
  }

  async getMyProfile(user: AuthUser) {
    const studentId = await this.getMyStudentId(user);

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
            emailNotificationsEnabled: true,
            pushNotificationsEnabled: true,
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

    return { message: 'My profile fetched successfully', data: student };
  }

  async getMyClasses(user: AuthUser) {
    const studentId = await this.getMyStudentId(user);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, schoolId: user.schoolId, status: 'ACTIVE' },
      select: {
        id: true,
        classId: true,
        sectionId: true,
        academicYearId: true,
        status: true,
        enrolledAt: true,
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            academicYear: { select: { id: true, name: true } },
            sections: { select: { id: true, name: true } },
            courses: {
              where: { status: 'ACTIVE' },
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        section: { select: { id: true, name: true, capacity: true } },
        academicYear: { select: { id: true, name: true } },
      },
    });

    return {
      message: 'My classes fetched successfully',
      data: enrollments.map((e) => ({
        ...e,
        class: {
          ...e.class,
          subjects: e.class.courses.map((c) => c.subject),
        },
      })),
    };
  }

  async getMyAttendance(user: AuthUser, query: QueryAttendanceDto) {
    const studentId = await this.getMyStudentId(user);

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

  async getMyAssignments(user: AuthUser, query: QueryAssignmentDto) {
    const studentId = await this.getMyStudentId(user);

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

  async getMyExams(user: AuthUser, query: QueryExamDto) {
    const studentId = await this.getMyStudentId(user);

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

  async getMyResults(user: AuthUser, query: QueryResultDto) {
    const studentId = await this.getMyStudentId(user);

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

  async getMyNotifications(user: AuthUser, query: QueryNotificationDto) {
    const studentId = await this.getMyStudentId(user);

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
  // STUDENT DASHBOARD
  // =====================================================

  async getDashboard(user: AuthUser) {
    const studentId = await this.getMyStudentId(user);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId, schoolId: user.schoolId },
      select: {
        id: true,
        studentCode: true,
        user: { select: { id: true, name: true, avatar: true } },
        enrollments: {
          where: { status: 'ACTIVE' },
          select: {
            class: { select: { id: true, name: true, code: true, academicYearId: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrolledClassIds = student.enrollments.map((e) => e.class.id);
    const academicYearIds = student.enrollments
      .map((e) => e.class.academicYearId)
      .filter((id): id is string => Boolean(id));

    const [
      totalAssignments,
      pendingAssignments,
      upcomingExams,
      recentResults,
      attendanceToday,
      unreadNotifications,
      activeAcademicYear,
    ] = await Promise.all([
      this.prisma.assignment.count({
        where: {
          schoolId: user.schoolId,
          classId: { in: enrolledClassIds },
          status: 'PUBLISHED',
        },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'LATE'] },
        },
      }),
      this.prisma.exam.findMany({
        where: {
          schoolId: user.schoolId,
          academicYearId: { in: academicYearIds },
          startDate: { gte: new Date() },
          status: { in: ['SCHEDULED', 'ONGOING'] },
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
        where: { studentId, schoolId: user.schoolId },
        select: {
          id: true,
          marks: true,
          grade: true,
          publishedAt: true,
          exam: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendance.count({
        where: { studentId, schoolId: user.schoolId, date: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.notification.count({
        where: { recipientId: student.user.id, isRead: false },
      }),
      this.prisma.academicYear.findFirst({
        where: { schoolId: user.schoolId, isCurrent: true },
        select: { id: true, name: true, startDate: true, endDate: true, status: true },
      }),
    ]);

    return {
      message: 'Student dashboard fetched successfully',
      data: {
        student,
        activeAcademicYear,
        counts: {
          totalAssignments,
          pendingAssignments,
          upcomingExams: upcomingExams.length,
        },
        upcomingExams,
        recentResults,
        today: { attendance: attendanceToday },
        unreadNotifications,
      },
    };
  }
}
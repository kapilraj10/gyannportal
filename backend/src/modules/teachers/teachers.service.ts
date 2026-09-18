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

import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { QueryTeacherDto } from './dto/query-teacher.dto.js';
import { QueryAttendanceDto } from '../attendance/dto/query-attendance.dto.js';
import { MarkAttendanceDto } from '../attendance/dto/mark-attendance.dto.js';
import { QueryAssignmentDto } from '../assignments/dto/query-assignment.dto.js';
import { CreateAssignmentDto } from '../assignments/dto/create-assignment.dto.js';
import { UpdateAssignmentDto } from '../assignments/dto/update-assignment.dto.js';
import { GradeSubmissionDto } from '../assignments/dto/grade-submission.dto.js';
import { QueryResultDto } from '../results/dto/query-result.dto.js';
import { CreateResultDto } from '../results/dto/create-result.dto.js';
import { UpdateResultDto } from '../results/dto/update-result.dto.js';
import { QueryNotificationDto } from '../notifications/dto/query-notification.dto.js';

const TEACHER_SELECT = {
  id: true,
  userId: true,
  schoolId: true,
  employeeCode: true,
  qualification: true,
  joiningDate: true,
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
      branch: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.TeacherSelect;

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateTeacherDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);

    if (dto.userId && (dto.name || dto.email || dto.password)) {
      throw new BadRequestException(
        'Use either an existing userId OR new user credentials, not both',
      );
    }

    if (dto.branchId) {
      await this.assertBranchInSchool(dto.branchId, schoolId);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let userId = dto.userId;

      if (userId) {
        const existingUser = await tx.user.findFirst({
          where: { id: userId, schoolId },
          include: { teacherProfile: { select: { id: true } } },
        });
        if (!existingUser) {
          throw new NotFoundException('User not found in this school');
        }
        if (existingUser.teacherProfile) {
          throw new ConflictException('User is already a teacher');
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
          where: { name: Role.TEACHER },
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

      const employeeCode =
        dto.employeeCode?.trim() ||
        `TCH-${schoolId.slice(0, 6).toUpperCase()}-${Date.now().toString(36)}`;

      const teacher = await tx.teacher.create({
        data: {
          userId,
          schoolId,
          employeeCode,
          qualification: dto.qualification?.trim(),
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
          status: dto.status,
        },
        select: TEACHER_SELECT,
      });

      return teacher;
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.TEACHER_CREATE,
      entity: 'Teacher',
      entityId: result.id,
      metadata: { employeeCode: result.employeeCode },
    });

    return { message: 'Teacher created successfully', data: result };
  }

  async findAll(user: AuthUser, query: QueryTeacherDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.TeacherWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.teacher.count({ where }),
      this.prisma.teacher.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...TEACHER_SELECT,
          _count: { select: { courses: true, teacherClasses: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: {
        ...TEACHER_SELECT,
        _count: { select: { courses: true, teacherClasses: true } },
      },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    assertSameSchool(user, teacher.schoolId);
    return { message: 'Teacher fetched successfully', data: teacher };
  }

  async update(user: AuthUser, id: string, dto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    assertSameSchool(user, teacher.schoolId);

    if (dto.userId || dto.email || dto.password || dto.schoolId) {
      throw new BadRequestException(
        'Credential and linkage fields cannot be changed here',
      );
    }

    if (dto.employeeCode) {
      const dup = await this.prisma.teacher.findFirst({
        where: {
          schoolId: teacher.schoolId,
          employeeCode: dto.employeeCode.trim(),
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new ConflictException('Employee code already exists');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.teacher.update({
        where: { id },
        data: {
          employeeCode: dto.employeeCode?.trim(),
          qualification: dto.qualification?.trim(),
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
          status: dto.status,
        },
        select: TEACHER_SELECT,
      });

      if (dto.name || dto.phone || dto.avatar || dto.gender) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: {
            name: dto.name?.trim(),
            phone: dto.phone?.trim(),
            avatar: dto.avatar,
            gender: dto.gender,
          },
        });
      }

      return profile;
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: teacher.schoolId,
      action: AuditAction.TEACHER_UPDATE,
      entity: 'Teacher',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Teacher updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: { id: true, schoolId: true, userId: true },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    assertSameSchool(user, teacher.schoolId);

    await this.prisma.$transaction([
      this.prisma.teacher.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: teacher.userId } }),
    ]);

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: teacher.schoolId,
      action: AuditAction.TEACHER_DELETE,
      entity: 'Teacher',
      entityId: id,
    });

    return { message: 'Teacher deleted successfully', data: null };
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

  // =====================================================
  // TEACHER PORTAL - MY DATA ACCESS
  // =====================================================

  private async getMyTeacherId(user: AuthUser): Promise<string> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }
    return teacher.id;
  }

  async getMyProfile(user: AuthUser) {
    const teacherId = await this.getMyTeacherId(user);

    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, schoolId: user.schoolId },
      select: {
        id: true,
        employeeCode: true,
        qualification: true,
        joiningDate: true,
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
            branch: { select: { id: true, name: true } },
          },
        },
        teacherClasses: {
          select: {
            id: true,
            classId: true,
            sectionId: true,
            subjectId: true,
            class: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            subjectId: true,
            classId: true,
            sectionId: true,
            subject: { select: { id: true, name: true, code: true } },
            class: { select: { id: true, name: true, code: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return { message: 'My profile fetched successfully', data: teacher };
  }

  async getMyClasses(user: AuthUser) {
    const teacherId = await this.getMyTeacherId(user);

    const teacherClasses = await this.prisma.teacherClass.findMany({
      where: { teacherId, schoolId: user.schoolId },
      select: {
        id: true,
        classId: true,
        sectionId: true,
        subjectId: true,
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            academicYear: { select: { id: true, name: true } },
          },
        },
        section: { select: { id: true, name: true, capacity: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
    });

    return { message: 'My assigned classes fetched successfully', data: teacherClasses };
  }

  async getMyStudents(user: AuthUser, query: QueryTeacherDto) {
    const teacherId = await this.getMyTeacherId(user);

    const teacherClasses = await this.prisma.teacherClass.findMany({
      where: { teacherId, schoolId: user.schoolId },
      select: { classId: true, sectionId: true },
    });

    if (!teacherClasses.length) {
      return { message: 'My students fetched successfully', data: [] };
    }

    const classIds = [...new Set(teacherClasses.map((tc) => tc.classId))];
    const sectionIds = [...new Set(teacherClasses.map((tc) => tc.sectionId).filter((s): s is string => Boolean(s)))];

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.StudentWhereInput = {
      schoolId: user.schoolId,
      enrollments: {
        some: {
          classId: { in: classIds },
          ...(sectionIds.length ? { sectionId: { in: sectionIds } } : {}),
          status: 'ACTIVE',
        },
      },
    };

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
          enrollments: {
            where: { classId: { in: classIds }, status: 'ACTIVE' },
            select: {
              id: true,
              classId: true,
              sectionId: true,
              class: { select: { id: true, name: true, code: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async getMyCourses(user: AuthUser) {
    const teacherId = await this.getMyTeacherId(user);

    const courses = await this.prisma.course.findMany({
      where: { teacherId, schoolId: user.schoolId, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        subjectId: true,
        classId: true,
        sectionId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
      },
    });

    return { message: 'My courses fetched successfully', data: courses };
  }

  // Attendance management
  async markAttendance(user: AuthUser, dto: MarkAttendanceDto) {
    const teacherId = await this.getMyTeacherId(user);

    // Verify teacher has access to this class
    const teacherClass = await this.prisma.teacherClass.findFirst({
      where: {
        teacherId,
        classId: dto.classId,
        schoolId: user.schoolId,
        ...(dto.sectionId ? { sectionId: dto.sectionId } : {}),
      },
      select: { id: true },
    });

    if (!teacherClass) {
      throw new ForbiddenException('You are not assigned to this class/section');
    }

    // Use the AttendanceService logic
    const schoolId = user.schoolId;
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const studentIds = dto.records.map((r) => r.studentId);
    const studentCount = await this.prisma.student.count({
      where: { id: { in: studentIds }, schoolId },
    });
    if (studentCount !== studentIds.length) {
      throw new BadRequestException(
        'One or more students are not found in this school',
      );
    }

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
            status: record.status ?? 'PRESENT',
            sectionId: dto.sectionId,
            markedBy: user.userId,
          },
          create: {
            schoolId,
            studentId: record.studentId,
            classId: dto.classId,
            sectionId: dto.sectionId,
            date,
            status: record.status ?? 'PRESENT',
            markedBy: user.userId,
          },
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

  async getMyAttendance(user: AuthUser, query: QueryAttendanceDto) {
    const teacherId = await this.getMyTeacherId(user);

    const teacherClasses = await this.prisma.teacherClass.findMany({
      where: { teacherId, schoolId: user.schoolId },
      select: { classId: true, sectionId: true },
    });

    if (!teacherClasses.length) {
      return paginate([], 0, query.page ?? 1, query.limit ?? 20);
    }

    const classIds = [...new Set(teacherClasses.map((tc) => tc.classId))];
    const sectionIds = [...new Set(teacherClasses.map((tc) => tc.sectionId).filter((s): s is string => Boolean(s)))];

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AttendanceWhereInput = {
      schoolId: user.schoolId,
      classId: { in: classIds },
    };

    if (sectionIds.length) where.sectionId = { in: sectionIds };
    if (query.status) where.status = query.status;
    if (query.studentId) where.studentId = query.studentId;
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
          student: {
            select: {
              id: true,
              studentCode: true,
              user: { select: { id: true, name: true } },
            },
          },
          class: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  // Assignment management
  async getMyAssignments(user: AuthUser, query: QueryAssignmentDto) {
    const teacherId = await this.getMyTeacherId(user);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AssignmentWhereInput = {
      schoolId: user.schoolId,
      teacherId,
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
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async createAssignment(user: AuthUser, dto: CreateAssignmentDto) {
    const teacherId = await this.getMyTeacherId(user);

    // Verify teacher has access to this class/section
    const teacherClass = await this.prisma.teacherClass.findFirst({
      where: {
        teacherId,
        classId: dto.classId,
        schoolId: user.schoolId,
        ...(dto.sectionId ? { sectionId: dto.sectionId } : {}),
      },
      select: { id: true },
    });

    if (!teacherClass) {
      throw new ForbiddenException('You are not assigned to this class/section');
    }

    // Verify references
    if (dto.subjectId) {
      const subj = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, schoolId: user.schoolId },
        select: { id: true },
      });
      if (!subj) throw new BadRequestException('Subject not found in school');
    }
    if (dto.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: dto.courseId, schoolId: user.schoolId, teacherId },
        select: { id: true },
      });
      if (!course) throw new BadRequestException('Course not found or not assigned to you');
    }

    const created = await this.prisma.assignment.create({
      data: {
        schoolId: user.schoolId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        courseId: dto.courseId,
        teacherId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status ?? 'DRAFT',
      },
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: user.schoolId,
      action: AuditAction.ASSIGNMENT_CREATE,
      entity: 'Assignment',
      entityId: created.id,
      metadata: { title: created.title },
    });

    return { message: 'Assignment created successfully', data: created };
  }

  async updateAssignment(user: AuthUser, id: string, dto: UpdateAssignmentDto) {
    const teacherId = await this.getMyTeacherId(user);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true, schoolId: true, teacherId: true, teacher: { select: { userId: true } } },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own assignments');
    }

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        classId: dto.classId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        courseId: dto.courseId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
      },
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: assignment.schoolId,
      action: AuditAction.ASSIGNMENT_UPDATE,
      entity: 'Assignment',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Assignment updated successfully', data: updated };
  }

  async deleteAssignment(user: AuthUser, id: string) {
    const teacherId = await this.getMyTeacherId(user);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true, schoolId: true, teacherId: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    await this.prisma.assignment.delete({ where: { id } });
    await this.auditLogs.log({
      userId: user.userId,
      schoolId: assignment.schoolId,
      action: AuditAction.ASSIGNMENT_DELETE,
      entity: 'Assignment',
      entityId: id,
    });

    return { message: 'Assignment deleted successfully', data: null };
  }

  async getAssignmentSubmissions(user: AuthUser, assignmentId: string) {
    const teacherId = await this.getMyTeacherId(user);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, schoolId: true, teacherId: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only view submissions of your own assignments');
    }

    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return { message: 'Submissions fetched successfully', data: submissions };
  }

  async gradeSubmission(user: AuthUser, submissionId: string, dto: GradeSubmissionDto) {
    const teacherId = await this.getMyTeacherId(user);

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        assignment: {
          select: {
            schoolId: true,
            teacherId: true,
          },
        },
      },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only grade submissions of your own assignments');
    }

    const graded = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks: dto.marks,
        remark: dto.remark,
        status: dto.status ?? 'GRADED',
      },
    });

    return { message: 'Submission graded successfully', data: graded };
  }

  // Results management
  async getMyResults(user: AuthUser, query: QueryResultDto) {
    const teacherId = await this.getMyTeacherId(user);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ResultWhereInput = {
      schoolId: user.schoolId,
      teacherId,
    };

    if (query.examId) where.examId = query.examId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.studentId) where.studentId = query.studentId;

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
          student: {
            select: {
              id: true,
              studentCode: true,
              user: { select: { id: true, name: true } },
            },
          },
          exam: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async createResult(user: AuthUser, dto: CreateResultDto) {
    const teacherId = await this.getMyTeacherId(user);

    // Verify the teacher is assigned to the subject/exam
    const exam = await this.prisma.exam.findFirst({
      where: { id: dto.examId, schoolId: user.schoolId },
      select: { id: true, subjects: { select: { id: true } } },
    });
    if (!exam) {
      throw new BadRequestException('Exam not found in school');
    }
    if (!exam.subjects.some((s) => s.id === dto.subjectId)) {
      throw new BadRequestException('Subject not part of this exam');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId: user.schoolId },
      select: { id: true },
    });
    if (!student) {
      throw new BadRequestException('Student not found in school');
    }

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
        schoolId: user.schoolId,
        studentId: dto.studentId,
        examId: dto.examId,
        subjectId: dto.subjectId,
        teacherId,
        marks: dto.marks,
        grade: dto.grade,
        remarks: dto.remarks,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: user.schoolId,
      action: AuditAction.RESULT_CREATE,
      entity: 'Result',
      entityId: created.id,
      metadata: { studentId: dto.studentId, examId: dto.examId },
    });

    return { message: 'Result created successfully', data: created };
  }

  async updateResult(user: AuthUser, id: string, dto: UpdateResultDto) {
    const teacherId = await this.getMyTeacherId(user);

    const result = await this.prisma.result.findUnique({
      where: { id },
      select: { id: true, schoolId: true, teacherId: true },
    });
    if (!result) {
      throw new NotFoundException('Result not found');
    }
    if (result.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own results');
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
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: result.schoolId,
      action: AuditAction.RESULT_UPDATE,
      entity: 'Result',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Result updated successfully', data: updated };
  }

  async getMyNotifications(user: AuthUser, query: QueryNotificationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = {
      recipientId: user.userId,
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
      where: { recipientId: user.userId, isRead: false },
    });

    return { ...paginate(rows, total, page, limit), unread };
  }

  // =====================================================
  // TEACHER DASHBOARD
  // =====================================================

  async getDashboard(user: AuthUser) {
    const teacherId = await this.getMyTeacherId(user);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const [
      myClasses,
      myStudents,
      myCourses,
      pendingAssignments,
      pendingSubmissions,
      ungradedSubmissions,
      attendanceToday,
      unreadNotifications,
      activeAcademicYear,
    ] = await Promise.all([
      this.prisma.teacherClass.count({
        where: { teacherId, schoolId: user.schoolId },
      }),
      this.prisma.student.count({
        where: {
          schoolId: user.schoolId,
          enrollments: {
            some: {
              class: {
                teacherClasses: { some: { teacherId } },
              },
              status: 'ACTIVE',
            },
          },
        },
      }),
      this.prisma.course.count({
        where: { teacherId, schoolId: user.schoolId, status: 'ACTIVE' },
      }),
      this.prisma.assignment.count({
        where: { teacherId, schoolId: user.schoolId, status: 'PUBLISHED' },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          assignment: { teacherId, schoolId: user.schoolId },
          status: 'SUBMITTED',
        },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          assignment: { teacherId, schoolId: user.schoolId },
          status: { in: ['SUBMITTED', 'LATE'] },
        },
      }),
      this.prisma.attendance.count({
        where: {
          schoolId: user.schoolId,
          date: { gte: todayStart, lte: todayEnd },
          class: { teacherClasses: { some: { teacherId } } },
        },
      }),
      this.prisma.notification.count({
        where: { recipientId: user.userId, isRead: false },
      }),
      this.prisma.academicYear.findFirst({
        where: { schoolId: user.schoolId, isCurrent: true },
        select: { id: true, name: true, startDate: true, endDate: true, status: true },
      }),
    ]);

    // Get recent activities
    const recentActivities = await this.prisma.auditLog.findMany({
      where: { schoolId: user.schoolId, userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
      },
    });

    return {
      message: 'Teacher dashboard fetched successfully',
      data: {
        teacherId,
        activeAcademicYear,
        counts: {
          myClasses,
          myStudents,
          myCourses,
          pendingAssignments,
          pendingSubmissions,
          ungradedSubmissions,
        },
        today: { attendance: attendanceToday },
        unreadNotifications,
        recentActivities,
      },
    };
  }
}
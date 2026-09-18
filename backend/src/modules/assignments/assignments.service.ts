import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import {
  AssignmentStatus,
  AssignmentSubmissionStatus,
} from '../../generated/prisma/client.js';
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

import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { UpdateAssignmentDto } from './dto/update-assignment.dto.js';
import { QueryAssignmentDto } from './dto/query-assignment.dto.js';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto.js';
import { GradeSubmissionDto } from './dto/grade-submission.dto.js';

const ASSIGNMENT_SELECT = {
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
} satisfies Prisma.AssignmentSelect;

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  private async resolveTeacherId(
    user: AuthUser,
    dto: CreateAssignmentDto,
    schoolId: string,
  ) {
    let teacherId = dto.teacherId;

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { schoolId, userId: user.userId },
        select: { id: true },
      });
      if (!teacher) {
        throw new ForbiddenException('No teacher profile linked to this account');
      }
      teacherId = teacher.id;
    }

    if (!teacherId) {
      throw new BadRequestException('teacherId is required');
    }

    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
      select: { id: true },
    });
    if (!teacher) {
      throw new BadRequestException('Teacher not found in school');
    }
    return teacherId;
  }

  async create(user: AuthUser, dto: CreateAssignmentDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);
    const teacherId = await this.resolveTeacherId(user, dto, schoolId);

    await this.assertReferences(schoolId, dto);

    const created = await this.prisma.assignment.create({
      data: {
        schoolId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        courseId: dto.courseId,
        teacherId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status ?? AssignmentStatus.DRAFT,
      },
      select: ASSIGNMENT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.ASSIGNMENT_CREATE,
      entity: 'Assignment',
      entityId: created.id,
      metadata: { title: created.title },
    });

    return { message: 'Assignment created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QueryAssignmentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AssignmentWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.courseId) where.courseId = query.courseId;

    if (user.role === Role.TEACHER) {
      where.teacher = { userId: user.userId };
    } else if (user.role === Role.STUDENT) {
      where.class = {
        enrollments: { some: { student: { userId: user.userId } } },
      };
    }

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
        select: { ...ASSIGNMENT_SELECT, _count: { select: { submissions: true } } },
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.assignment.findUnique({
      where: { id },
      select: ASSIGNMENT_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'Assignment fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateAssignmentDto) {
    const row = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true, schoolId: true, teacherId: true, teacher: { select: { userId: true } } },
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    assertSameSchool(user, row.schoolId);
    if (
      user.role === Role.TEACHER &&
      row.teacher.userId !== user.userId
    ) {
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
      select: ASSIGNMENT_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.ASSIGNMENT_UPDATE,
      entity: 'Assignment',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'Assignment updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true, schoolId: true, teacher: { select: { userId: true } } },
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    assertSameSchool(user, row.schoolId);
    if (user.role === Role.TEACHER && row.teacher.userId !== user.userId) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    await this.prisma.assignment.delete({ where: { id } });
    await this.auditLogs.log({
      userId: user.userId,
      schoolId: row.schoolId,
      action: AuditAction.ASSIGNMENT_DELETE,
      entity: 'Assignment',
      entityId: id,
    });

    return { message: 'Assignment deleted successfully', data: null };
  }

  async submit(user: AuthUser, assignmentId: string, dto: SubmitAssignmentDto) {
    if (user.role !== Role.STUDENT) {
      throw new ForbiddenException('Only students can submit assignments');
    }

    const student = await this.prisma.student.findFirst({
      where: { schoolId: user.schoolId, userId: user.userId },
      select: {
        id: true,
        enrollments: { select: { classId: true } },
      },
    });
    if (!student) {
      throw new ForbiddenException('No student profile linked to this account');
    }

    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        schoolId: user.schoolId,
        status: { not: AssignmentStatus.DRAFT },
      },
      select: { id: true, classId: true, status: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found or not open');
    }

    const enrolled = student.enrollments.some(
      (e) => e.classId === assignment.classId,
    );
    if (!enrolled) {
      throw new ForbiddenException('You are not enrolled in this class');
    }

    const submission = await this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id,
        },
      },
      update: {
        content: dto.content,
        attachmentId: dto.attachmentId,
        status: assignment.status === AssignmentStatus.CLOSED ? AssignmentSubmissionStatus.LATE : AssignmentSubmissionStatus.SUBMITTED,
      },
      create: {
        assignmentId,
        studentId: student.id,
        content: dto.content,
        attachmentId: dto.attachmentId,
        status: assignment.status === AssignmentStatus.CLOSED ? AssignmentSubmissionStatus.LATE : AssignmentSubmissionStatus.SUBMITTED,
      },
    });

    return {
      message: 'Assignment submitted successfully',
      data: submission,
    };
  }

  async listSubmissions(user: AuthUser, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        schoolId: true,
        teacher: { select: { userId: true } },
      },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    assertSameSchool(user, assignment.schoolId);
    if (
      user.role === Role.TEACHER &&
      assignment.teacher.userId !== user.userId
    ) {
      throw new ForbiddenException(
        'You can only view submissions of your own assignments',
      );
    }

    const submissions =
      user.role === Role.STUDENT
        ? await this.prisma.assignmentSubmission.findMany({
            where: {
              assignmentId,
              student: { userId: user.userId },
            },
            include: {
              student: {
                select: {
                  id: true,
                  user: { select: { id: true, name: true } },
                },
              },
            },
          })
        : await this.prisma.assignmentSubmission.findMany({
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

  async gradeSubmission(
    user: AuthUser,
    submissionId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        assignment: {
          select: {
            schoolId: true,
            teacher: { select: { userId: true } },
          },
        },
      },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const schoolId = submission.assignment.schoolId;
    assertSameSchool(user, schoolId);
    if (
      user.role === Role.TEACHER &&
      submission.assignment.teacher.userId !== user.userId
    ) {
      throw new ForbiddenException(
        'You can only grade submissions of your own assignments',
      );
    }

    const graded = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks: dto.marks,
        remark: dto.remark,
        status: dto.status ?? AssignmentSubmissionStatus.GRADED,
      },
    });

    return { message: 'Submission graded successfully', data: graded };
  }

  private async assertReferences(schoolId: string, dto: CreateAssignmentDto) {
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
    if (dto.subjectId) {
      const s = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, schoolId },
        select: { id: true },
      });
      if (!s) throw new BadRequestException('Subject not found in school');
    }
    if (dto.courseId) {
      const c = await this.prisma.course.findFirst({
        where: { id: dto.courseId, schoolId },
        select: { id: true },
      });
      if (!c) throw new BadRequestException('Course not found in school');
    }
  }
}
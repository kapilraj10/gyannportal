import { BadRequestException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { UsersService } from '../../users/users.service.js';
import { UpdateProfileDto } from '../../users/dto/update-profile.dto.js';

@Injectable()
export class SchoolAdminService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  async dashboard(user: AuthUser, requestedSchoolId?: string) {
    const schoolId =
      user.role === Role.SUPER_ADMIN && requestedSchoolId
        ? requestedSchoolId
        : user.schoolId;

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true, code: true, status: true, logo: true },
    });
    if (!school) {
      throw new BadRequestException('School not found');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const [
      students,
      teachers,
      parents,
      classes,
      sections,
      subjects,
      courses,
      exams,
      assignments,
      attendanceToday,
      noticesToday,
      activeAcademicYear,
      recentActivities,
    ] = await Promise.all([
      this.prisma.student.count({ where: { schoolId } }),
      this.prisma.teacher.count({ where: { schoolId } }),
      this.prisma.parent.count({ where: { schoolId } }),
      this.prisma.class.count({ where: { schoolId } }),
      this.prisma.section.count({ where: { schoolId } }),
      this.prisma.subject.count({ where: { schoolId } }),
      this.prisma.course.count({ where: { schoolId } }),
      this.prisma.exam.count({ where: { schoolId } }),
      this.prisma.assignment.count({ where: { schoolId } }),
      this.prisma.attendance.count({
        where: { schoolId, date: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.notification.count({
        where: { schoolId, createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.academicYear.findFirst({
        where: { schoolId, isCurrent: true },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      }),
      this.prisma.auditLog.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          metadata: true,
          createdAt: true,
          user: { select: { id: true, name: true, role: { select: { name: true } } } },
        },
      }),
    ]);

    return {
      message: 'School dashboard fetched successfully',
      data: {
        school,
        activeAcademicYear,
        counts: {
          students,
          teachers,
          parents,
          classes,
          sections,
          subjects,
          courses,
          exams,
          assignments,
        },
        today: { attendance: attendanceToday, notices: noticesToday },
        recentActivities,
      },
    };
  }

  // =====================================================
  // PROFILE
  // =====================================================

  async getProfile(user: AuthUser) {
    const profile = await this.usersService.getMyProfile(user);
    return {
      message: 'School admin profile fetched successfully',
      data: profile,
    };
  }

  async updateProfile(user: AuthUser, dto: UpdateProfileDto) {
    const profile = await this.usersService.updateProfile(user, dto);
    return {
      message: 'School admin profile updated successfully',
      data: profile,
    };
  }
}
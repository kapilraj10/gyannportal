import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { SchoolStatus, UserStatus } from '../../generated/prisma/client.js';
import type { AuthUser } from '../../common/types/auth-user.js';

import { SchoolsService, type RequestMeta } from '../schools/schools.service.js';
import { AdminUsersService } from '../../users/admin-users.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

import { CreateSchoolDto } from '../schools/dto/create-school.dto.js';
import { UpdateSchoolDto } from '../schools/dto/update-school.dto.js';
import { QuerySchoolDto } from '../schools/dto/query-school.dto.js';
import { QueryUserDto } from '../../users/dto/query-user.dto.js';
import { QueryAuditLogDto } from '../audit-logs/dto/query-audit-log.dto.js';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly schoolsService: SchoolsService,
    private readonly adminUsersService: AdminUsersService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  async dashboard(user: AuthUser) {
    const [
      totalSchools,
      activeSchools,
      suspendedSchools,
      pendingSchools,
      totalUsers,
      totalStudents,
      totalTeachers,
      totalParents,
      recentSchools,
      recentUsers,
      roles,
    ] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.school.count({ where: { status: SchoolStatus.ACTIVE } }),
      this.prisma.school.count({ where: { status: SchoolStatus.SUSPENDED } }),
      this.prisma.school.count({ where: { status: SchoolStatus.PENDING } }),
      this.prisma.user.count(),
      this.prisma.student.count(),
      this.prisma.teacher.count(),
      this.prisma.parent.count(),
      this.prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          createdAt: true,
          _count: { select: { users: true, students: true } },
        },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { name: true } },
          createdAt: true,
        },
      }),
      this.prisma.user.groupBy({
        by: ['roleId'],
        _count: { _all: true },
      }),
    ]);

    const roleNames = await this.prisma.role.findMany({
      where: { id: { in: roles.map((r) => r.roleId) } },
      select: { id: true, name: true },
    });
    const roleNameById = new Map(roleNames.map((r) => [r.id, r.name]));

    return {
      message: 'Super admin dashboard fetched successfully',
      data: {
        schools: {
          total: totalSchools,
          active: activeSchools,
          suspended: suspendedSchools,
          pending: pendingSchools,
        },
        users: {
          total: totalUsers,
          byRole: roles.map((r) => ({
            role: roleNameById.get(r.roleId) ?? Role.STUDENT,
            count: r._count._all,
          })),
        },
        profiles: {
          students: totalStudents,
          teachers: totalTeachers,
          parents: totalParents,
        },
        recentSchools,
        recentRegistrations: recentUsers,
      },
    };
  }

  // =====================================================
  // SCHOOLS
  // =====================================================

  listSchools(user: AuthUser, query: QuerySchoolDto) {
    return this.schoolsService.findAll(user, query);
  }

  createSchool(user: AuthUser, dto: CreateSchoolDto, meta: RequestMeta = {}) {
    return this.schoolsService.create(user, dto, meta);
  }

  getSchool(user: AuthUser, id: string) {
    return this.schoolsService.findOne(user, id);
  }

  updateSchool(
    user: AuthUser,
    id: string,
    dto: UpdateSchoolDto,
    meta: RequestMeta = {},
  ) {
    return this.schoolsService.update(user, id, dto, meta);
  }

  deleteSchool(user: AuthUser, id: string, meta: RequestMeta = {}) {
    return this.schoolsService.remove(user, id, meta);
  }

  // =====================================================
  // USERS
  // =====================================================

  listUsers(user: AuthUser, query: QueryUserDto) {
    return this.adminUsersService.findAll(user, query);
  }

  updateUserStatus(user: AuthUser, id: string, status: UserStatus) {
    return this.adminUsersService.updateStatus(user, id, status);
  }

  // =====================================================
  // AUDIT LOGS
  // =====================================================

  listAuditLogs(user: AuthUser, query: QueryAuditLogDto) {
    return this.auditLogs.list(user, query);
  }
}
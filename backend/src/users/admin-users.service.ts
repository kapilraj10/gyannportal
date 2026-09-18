import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

import { Prisma } from '../generated/prisma/client.js';
import { UserStatus } from '../generated/prisma/client.js';
import { DatabaseService } from '../database/database.service.js';
import { AuditLogsService } from '../modules/audit-logs/audit-logs.service.js';
import { AuditAction } from '../common/enums/audit-action.enum.js';
import { Role } from '../common/enums/role.enum.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { getSkip, paginate } from '../common/pagination/pagination.dto.js';
import {
  assertSameSchool,
  resolveSchoolId,
} from '../common/helpers/access.helper.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';

const USER_SELECT = {
  id: true,
  schoolId: true,
  branchId: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  gender: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
  school: { select: { id: true, name: true, code: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateUserDto) {
    const schoolId = resolveSchoolId(user, dto.schoolId);
    this.assertRoleAllowed(user, dto.role);

    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
      select: { id: true },
    });
    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    if (dto.branchId) {
      await this.assertBranchInSchool(dto.branchId, schoolId);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const created = await this.prisma.user.create({
      data: {
        schoolId,
        branchId: dto.branchId,
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim(),
        passwordHash,
        gender: dto.gender,
        avatar: dto.avatar,
        status: dto.status ?? UserStatus.ACTIVE,
        roleId: role.id,
      },
      select: USER_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId,
      action: AuditAction.USER_CREATE,
      entity: 'User',
      entityId: created.id,
      metadata: { email: created.email, role: dto.role },
    });

    return { message: 'User created successfully', data: created };
  }

  async findAll(user: AuthUser, query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.schoolId = user.schoolId;
    }
    if (query.status) where.status = query.status;
    if (query.branchId) where.branchId = query.branchId;
    if (query.role) where.role = { name: query.role };

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: USER_SELECT,
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!row) {
      throw new NotFoundException('User not found');
    }
    assertSameSchool(user, row.schoolId);
    return { message: 'User fetched successfully', data: row };
  }

  async update(user: AuthUser, id: string, dto: UpdateUserDto) {
    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, schoolId: true, role: { select: { name: true } } },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    assertSameSchool(user, target.schoolId);
    this.assertRoleAllowed(user, target.role.name);

    if (dto.role) {
      this.assertRoleAllowed(user, dto.role);
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const duplicate = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.branchId) {
      await this.assertBranchInSchool(dto.branchId, target.schoolId);
    }

    const role = dto.role
      ? await this.prisma.role.findUnique({
          where: { name: dto.role },
          select: { id: true },
        })
      : null;
    if (dto.role && !role) {
      throw new BadRequestException('Invalid role');
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        email: dto.email?.trim().toLowerCase(),
        phone: dto.phone?.trim(),
        avatar: dto.avatar,
        gender: dto.gender,
        status: dto.status,
        branchId: dto.branchId,
        passwordHash,
        roleId: role?.id,
      },
      select: USER_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: target.schoolId,
      action: AuditAction.USER_UPDATE,
      entity: 'User',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
    });

    return { message: 'User updated successfully', data: updated };
  }

  async updateStatus(
    user: AuthUser,
    id: string,
    status: UserStatus,
  ) {
    if (id === user.userId && status !== UserStatus.ACTIVE) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        schoolId: true,
        status: true,
        role: { select: { name: true } },
      },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    assertSameSchool(user, target.schoolId);
    this.assertRoleAllowed(user, target.role.name);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: USER_SELECT,
    });

    if (status !== UserStatus.ACTIVE) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: target.schoolId,
      action: AuditAction.USER_STATUS_CHANGE,
      entity: 'User',
      entityId: id,
      metadata: { from: target.status, to: status, role: target.role.name },
    });

    return { message: 'User status updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string) {    if (id === user.userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, schoolId: true, role: { select: { name: true } } },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    assertSameSchool(user, target.schoolId);
    this.assertRoleAllowed(user, target.role.name);

    await this.prisma.user.delete({ where: { id } });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: target.schoolId,
      action: AuditAction.USER_DELETE,
      entity: 'User',
      entityId: id,
      metadata: { role: target.role.name },
    });

    return { message: 'User deleted successfully', data: null };
  }

  private assertRoleAllowed(user: AuthUser, role: string) {
    if (role === Role.SUPER_ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only a SUPER_ADMIN can manage SUPER_ADMIN accounts',
      );
    }
  }

  private async assertBranchInSchool(branchId: string, schoolId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, schoolId },
      select: { id: true, status: true },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found in this school');
    }
  }
}
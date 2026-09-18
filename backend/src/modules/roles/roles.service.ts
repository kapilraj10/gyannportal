import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

import { DatabaseService } from '../../database/database.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AuditAction } from '../../common/enums/audit-action.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';

import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

const ROLE_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { users: true, rolePermissions: true } },
} satisfies Prisma.RoleSelect;

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: ROLE_SELECT,
    });
    return { message: 'Roles fetched successfully', data: roles };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: {
        ...ROLE_SELECT,
        rolePermissions: {
          select: { permission: { select: { id: true, name: true } } },
        },
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const { rolePermissions, ...rest } = role;
    return {
      message: 'Role fetched successfully',
      data: {
        ...rest,
        permissions: rolePermissions.map((rp) => rp.permission),
      },
    };
  }

  async create(user: AuthUser, dto: CreateRoleDto) {
    const name = dto.name.trim().toUpperCase();

    const existing = await this.prisma.role.findUnique({
      where: { name },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Role already exists');
    }

    await this.assertPermissionsExist(dto.permissionIds);

    const created = await this.prisma.role.create({
      data: {
        name,
        rolePermissions: dto.permissionIds?.length
          ? {
              create: dto.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      select: ROLE_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: user.schoolId,
      action: AuditAction.ROLE_CREATE,
      entity: 'Role',
      entityId: created.id,
      metadata: { name },
    });

    return { message: 'Role created successfully', data: created };
  }

  async update(user: AuthUser, id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.assertPermissionsExist(dto.permissionIds);

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
        skipDuplicates: true,
      }),
    ]);

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: user.schoolId,
      action: AuditAction.ROLE_PERMISSIONS_UPDATE,
      entity: 'Role',
      entityId: id,
      metadata: { name: role.name, permissionCount: dto.permissionIds.length },
    });

    return this.findOne(id);
  }

  async remove(user: AuthUser, id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true, name: true, _count: { select: { users: true } } },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if ((Object.values(Role) as string[]).includes(role.name)) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    if (role._count.users > 0) {
      throw new BadRequestException('Role is assigned to users');
    }

    await this.prisma.role.delete({ where: { id } });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: user.schoolId,
      action: AuditAction.ROLE_DELETE,
      entity: 'Role',
      entityId: id,
      metadata: { name: role.name },
    });

    return { message: 'Role deleted successfully', data: null };
  }

  private async assertPermissionsExist(permissionIds?: string[]) {
    if (!permissionIds?.length) return;

    const count = await this.prisma.permission.count({
      where: { id: { in: permissionIds } },
    });
    if (count !== permissionIds.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }
  }
}
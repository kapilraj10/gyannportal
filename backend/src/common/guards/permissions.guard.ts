import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../database/database.service.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { Role } from '../enums/role.enum.js';
import type { AuthUser } from '../types/auth-user.js';

/**
 * Enforces @Permissions(...) metadata.
 *
 * Looks up the current user's role -> permissions mapping from the database.
 * SUPER_ADMIN implicitly holds every permission.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      select: {
        rolePermissions: {
          select: { permission: { select: { name: true } } },
        },
      },
    });

    const granted = new Set(
      role?.rolePermissions.map((rp) => rp.permission.name) ?? [],
    );

    const allowed = required.some((permission) => granted.has(permission));

    if (!allowed) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
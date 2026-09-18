import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../enums/role.enum.js';
import type { AuthUser } from '../types/auth-user.js';

const SCHOOL_FIELD = 'schoolId';

/**
 * Defense-in-depth tenant guard.
 *
 * Rejects any request that attempts to supply a `schoolId` (in the route
 * params, query string or body) that does not match the authenticated user's
 * school. SUPER_ADMIN may operate across all tenants.
 *
 * Services still enforce tenant ownership on every query — this guard only
 * blocks the obvious "trust the frontend" mistakes early.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user || user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const candidates = [
      request.params?.[SCHOOL_FIELD],
      request.query?.[SCHOOL_FIELD],
      request.body?.[SCHOOL_FIELD],
    ].filter((value): value is string => typeof value === 'string' && value.length > 0);

    for (const candidate of candidates) {
      if (candidate !== user.schoolId) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
    }

    return true;
  }
}
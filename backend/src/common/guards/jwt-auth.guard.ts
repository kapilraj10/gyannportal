import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Global JWT authentication guard.
 *
 * - Skips routes annotated with @Public().
 * - Validates the Bearer token using the passport `jwt` strategy.
 * - Attaches the authenticated user to `request.user`.
 * - Returns 401 for missing / invalid / expired tokens.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: unknown, user: unknown): TUser {
    if (err || !user) {
      throw err instanceof Error
        ? new UnauthorizedException('Invalid or expired token')
        : new UnauthorizedException('Invalid or expired token');
    }
    return user as TUser;
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Validates the refresh token supplied in the request body (`refreshToken`).
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-token') {
  handleRequest<TUser = unknown>(err: unknown, user: unknown): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return user as TUser;
  }
}
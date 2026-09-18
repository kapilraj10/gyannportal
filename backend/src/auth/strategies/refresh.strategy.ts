import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

/**
 * Validates refresh JWTs. Refresh tokens are signed with a dedicated secret
 * and are additionally tracked (hashed) in the database so they can be
 * revoked/rotated.
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: false,
    });
  }

  validate(payload: RefreshTokenPayload) {
    return { userId: payload.sub };
  }
}
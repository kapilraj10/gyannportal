import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from '../../common/types/auth-user.js';

interface JwtPayload {
  sub: string;
  email?: string;
  schoolId: string;
  roleId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email ?? '',
      schoolId: payload.schoolId,
      roleId: payload.roleId,
      role: payload.role,
    };
  }
}
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';

import { AuthService, type RequestMeta } from './auth.service.js';

import { RegisterSchoolDto } from './dto/register-school.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { Public } from '../common/decorators/public.decorator.js';

import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';

function extractMeta(req: Request): RequestMeta {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : undefined;

  const userAgent = req.headers['user-agent'];

  return {
    ipAddress: forwardedIp ?? req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  };
}

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================================
  // POST /auth/register-school
  // =====================================================

  @Public()
  @Post('register-school')
  @ApiOperation({ summary: 'Register a new school and its admin' })
  async registerSchool(@Body() dto: RegisterSchoolDto, @Req() req: Request) {
    return this.authService.registerSchool(dto, extractMeta(req));
  }

  // =====================================================
  // POST /auth/login
  // =====================================================

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Authenticate and receive access + refresh tokens' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, extractMeta(req));
  }

  // =====================================================
  // POST /auth/refresh
  // =====================================================

  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate a refresh token and issue new tokens' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: { userId: string },
    @Req() req: Request,
  ) {
    return this.authService.refresh(dto, user.userId, extractMeta(req));
  }

  // =====================================================
  // POST /auth/logout
  // =====================================================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token(s) for the current user' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Body() dto: LogoutDto,
    @Req() req: Request,
  ) {
    return this.authService.logout(user.userId, dto, extractMeta(req));
  }

  // =====================================================
  // GET /auth/me
  // =====================================================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user' })
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.userId);
  }

  // =====================================================
  // POST /auth/change-password
  // =====================================================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @ApiOperation({ summary: 'Change the current user password' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }
}
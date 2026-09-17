import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service.js';

import { RegisterSchoolDto } from './dto/register-school.dto.js';
import { LoginDto } from './dto/login.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================================
  // SCHOOL REGISTER
  // POST /auth/register-school
  // =====================================================

  @Post('register-school')
  async registerSchool(@Body() dto: RegisterSchoolDto) {
    return this.authService.registerSchool(dto);
  }

  // =====================================================
  // LOGIN
  // POST /auth/login
  // =====================================================

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // =====================================================
  // CURRENT USER
  // GET /auth/me
  // =====================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getMe(user.userId);
  }
}
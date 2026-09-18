import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =====================================================
  // GET /users/me
  // =====================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getMyProfile(user);
  }

  // =====================================================
  // PATCH /users/me
  // =====================================================

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user, dto);
  }

  // =====================================================
  // GET /users/:id
  // =====================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.usersService.getPublicProfile(id, user.schoolId);
  }

  // =====================================================
  // GET /users/:id/karma
  // =====================================================

  @Get(':id/karma')
  @UseGuards(JwtAuthGuard)
  getKarma(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.usersService.getKarmaBreakdown(id, user.schoolId);
  }

  // =====================================================
  // GET /users/:id/posts
  // =====================================================

  @Get(':id/posts')
  @UseGuards(JwtAuthGuard)
  getPosts(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.usersService.getCreatedPosts(id, user.schoolId);
  }

  // =====================================================
  // GET /users/:id/comments
  // =====================================================

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  getComments(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.usersService.getCreatedComments(id, user.schoolId);
  }
}
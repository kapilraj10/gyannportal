import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';

import { SuperAdminService } from './super-admin.service.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { CreateSchoolDto } from '../schools/dto/create-school.dto.js';
import { UpdateSchoolDto } from '../schools/dto/update-school.dto.js';
import { QuerySchoolDto } from '../schools/dto/query-school.dto.js';
import { QueryUserDto } from '../../users/dto/query-user.dto.js';
import { QueryAuditLogDto } from '../audit-logs/dto/query-audit-log.dto.js';
import type { RequestMeta } from '../schools/schools.service.js';

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

@ApiTags('Super Admin')
@ApiBearerAuth('access-token')
@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@UseInterceptors(TransformInterceptor)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform-wide dashboard (SUPER_ADMIN)' })
  dashboard(@CurrentUser() user: AuthUser) {
    return this.superAdminService.dashboard(user);
  }

  // =====================================================
  // SCHOOLS
  // =====================================================

  @Get('schools')
  @ApiOperation({ summary: 'List all schools (SUPER_ADMIN)' })
  listSchools(@CurrentUser() user: AuthUser, @Query() query: QuerySchoolDto) {
    return this.superAdminService.listSchools(user, query);
  }

  @Post('schools')
  @ApiOperation({ summary: 'Create a school (optionally with its admin)' })
  createSchool(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSchoolDto,
    @Req() req: Request,
  ) {
    return this.superAdminService.createSchool(user, dto, extractMeta(req));
  }

  @Get('schools/:id')
  @ApiOperation({ summary: 'Get a school by id' })
  getSchool(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.superAdminService.getSchool(user, id);
  }

  @Patch('schools/:id')
  @ApiOperation({ summary: 'Update a school' })
  updateSchool(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
    @Req() req: Request,
  ) {
    return this.superAdminService.updateSchool(user, id, dto, extractMeta(req));
  }

  @Delete('schools/:id')
  @ApiOperation({ summary: 'Delete a school' })
  deleteSchool(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.superAdminService.deleteSchool(user, id, extractMeta(req));
  }

  // =====================================================
  // USERS
  // =====================================================

  @Get('users')
  @ApiOperation({ summary: 'List all users across the platform' })
  listUsers(@CurrentUser() user: AuthUser, @Query() query: QueryUserDto) {
    return this.superAdminService.listUsers(user, query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate/suspend/deactivate a user' })
  updateUserStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.superAdminService.updateUserStatus(user, id, dto.status);
  }

  // =====================================================
  // AUDIT LOGS
  // =====================================================

  @Get('audit-logs')
  @ApiOperation({ summary: 'List platform-wide audit logs' })
  listAuditLogs(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryAuditLogDto,
  ) {
    return this.superAdminService.listAuditLogs(user, query);
  }
}
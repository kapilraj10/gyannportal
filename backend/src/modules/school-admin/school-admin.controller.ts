import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { UpdateProfileDto } from '../../users/dto/update-profile.dto.js';

import { SchoolAdminService } from './school-admin.service.js';

class DashboardQuery {
  @IsOptional()
  @Type(() => String)
  @IsString()
  schoolId?: string;
}

@ApiTags('School Admin')
@ApiBearerAuth('access-token')
@Controller('school-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class SchoolAdminController {
  constructor(private readonly schoolAdminService: SchoolAdminService) {}

  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'School dashboard (SUPER_ADMIN/SCHOOL_ADMIN)' })
  dashboard(@CurrentUser() user: AuthUser, @Query() query: DashboardQuery) {
    return this.schoolAdminService.dashboard(user, query.schoolId);
  }

  @Get('profile')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get the current school admin profile' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.schoolAdminService.getProfile(user);
  }

  @Patch('profile')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update the current school admin profile' })
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.schoolAdminService.updateProfile(user, dto);
  }
}
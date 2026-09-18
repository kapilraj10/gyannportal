import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor.js';
import { Role } from '../../common/enums/role.enum.js';
import { Permission } from '../../common/enums/permission.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';

import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { BulkEnrollDto } from './dto/bulk-enroll.dto.js';
import { QueryEnrollmentDto } from './dto/query-enrollment.dto.js';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('bulk')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_UPDATE)
  @ApiOperation({ summary: 'Bulk enroll students into a class' })
  bulkCreate(@CurrentUser() user: AuthUser, @Body() dto: BulkEnrollDto) {
    return this.enrollmentsService.bulkCreate(user, dto);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_CREATE)
  @ApiOperation({ summary: 'Enroll a student in a class' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'List enrollments' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryEnrollmentDto) {
    return this.enrollmentsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'Get an enrollment by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.enrollmentsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_UPDATE)
  @ApiOperation({ summary: 'Update an enrollment' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_UPDATE)
  @ApiOperation({ summary: 'Delete an enrollment' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.enrollmentsService.remove(user, id);
  }
}
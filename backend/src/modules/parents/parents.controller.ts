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

import { ParentsService } from './parents.service.js';
import { CreateParentDto } from './dto/create-parent.dto.js';
import { UpdateParentDto } from './dto/update-parent.dto.js';
import { QueryParentDto } from './dto/query-parent.dto.js';
import { QueryAttendanceDto } from '../attendance/dto/query-attendance.dto.js';
import { QueryAssignmentDto } from '../assignments/dto/query-assignment.dto.js';
import { QueryExamDto } from '../exams/dto/query-exam.dto.js';
import { QueryResultDto } from '../results/dto/query-result.dto.js';
import { QueryNotificationDto } from '../notifications/dto/query-notification.dto.js';

@ApiTags('Parents')
@ApiBearerAuth()
@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.PARENT_CREATE)
  @ApiOperation({ summary: 'Create a parent (profile + optional children)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateParentDto) {
    return this.parentsService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.PARENT_READ)
  @ApiOperation({ summary: 'List parents (paginated, tenant-scoped)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryParentDto) {
    return this.parentsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.PARENT_READ)
  @ApiOperation({ summary: 'Get a parent by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.parentsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.PARENT_UPDATE)
  @ApiOperation({ summary: 'Update a parent' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.PARENT_DELETE)
  @ApiOperation({ summary: 'Delete a parent' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.parentsService.remove(user, id);
  }

  // =====================================================
  // PARENT PORTAL - MY CHILDREN
  // =====================================================

  @Get('me/children')
  @Roles(Role.PARENT)
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get my children (PARENT)' })
  getMyChildren(@CurrentUser() user: AuthUser) {
    return this.parentsService.getMyChildren(user);
  }

  @Get('me/children/:studentId')
  @Roles(Role.PARENT)
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get my child profile (PARENT)' })
  getChildProfile(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    return this.parentsService.getChildProfile(user, studentId);
  }

  @Get('me/children/:studentId/attendance')
  @Roles(Role.PARENT)
  @Permissions(Permission.ATTENDANCE_READ)
  @ApiOperation({ summary: 'Get my child attendance (PARENT)' })
  getChildAttendance(
    @CurrentUser() user: AuthUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.parentsService.getChildAttendance(user, studentId, query);
  }

  @Get('me/children/:studentId/assignments')
  @Roles(Role.PARENT)
  @Permissions(Permission.ASSIGNMENT_READ)
  @ApiOperation({ summary: 'Get my child assignments (PARENT)' })
  getChildAssignments(
    @CurrentUser() user: AuthUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryAssignmentDto,
  ) {
    return this.parentsService.getChildAssignments(user, studentId, query);
  }

  @Get('me/children/:studentId/exams')
  @Roles(Role.PARENT)
  @Permissions(Permission.EXAM_READ)
  @ApiOperation({ summary: 'Get my child exams (PARENT)' })
  getChildExams(
    @CurrentUser() user: AuthUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryExamDto,
  ) {
    return this.parentsService.getChildExams(user, studentId, query);
  }

  @Get('me/children/:studentId/results')
  @Roles(Role.PARENT)
  @Permissions(Permission.RESULT_READ)
  @ApiOperation({ summary: 'Get my child results (PARENT)' })
  getChildResults(
    @CurrentUser() user: AuthUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryResultDto,
  ) {
    return this.parentsService.getChildResults(user, studentId, query);
  }

  @Get('me/children/:studentId/notifications')
  @Roles(Role.PARENT)
  @Permissions(Permission.NOTIFICATION_READ)
  @ApiOperation({ summary: 'Get my child notifications (PARENT)' })
  getChildNotifications(
    @CurrentUser() user: AuthUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryNotificationDto,
  ) {
    return this.parentsService.getChildNotifications(user, studentId, query);
  }

  // Dashboard
  @Get('me/dashboard')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: 'Get parent dashboard (PARENT)' })
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.parentsService.getDashboard(user);
  }
}
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

import { AttendanceService } from './attendance.service.js';
import { MarkAttendanceDto } from './dto/mark-attendance.dto.js';
import { QueryAttendanceDto } from './dto/query-attendance.dto.js';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.ATTENDANCE_CREATE)
  @ApiOperation({ summary: 'Mark attendance for a class on a date' })
  mark(@CurrentUser() user: AuthUser, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.mark(user, dto);
  }

  @Get('summary')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.ATTENDANCE_READ)
  @ApiOperation({ summary: 'Attendance summary grouped by status' })
  summary(
    @CurrentUser() user: AuthUser,
    @Query() query: { classId?: string; sectionId?: string; from?: string; to?: string },
  ) {
    return this.attendanceService.summary(user, query);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.ATTENDANCE_READ)
  @ApiOperation({ summary: 'List attendance records' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.ATTENDANCE_READ)
  @ApiOperation({ summary: 'Get an attendance record by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attendanceService.findOne(user, id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.ATTENDANCE_UPDATE)
  @ApiOperation({ summary: 'Delete an attendance record' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attendanceService.remove(user, id);
  }
}
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

import { StudentsService } from './students.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { QueryStudentDto } from './dto/query-student.dto.js';
import { QueryAttendanceDto } from '../attendance/dto/query-attendance.dto.js';
import { QueryAssignmentDto } from '../assignments/dto/query-assignment.dto.js';
import { QueryExamDto } from '../exams/dto/query-exam.dto.js';
import { QueryResultDto } from '../results/dto/query-result.dto.js';
import { QueryNotificationDto } from '../notifications/dto/query-notification.dto.js';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_CREATE)
  @ApiOperation({ summary: 'Create a student (profile + optional account)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStudentDto) {
    return this.studentsService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'List students (paginated, tenant-scoped)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryStudentDto) {
    return this.studentsService.findAll(user, query);
  }

  // =====================================================
  // STUDENT PORTAL - MY DATA
  // =====================================================

  @Get('me')
  @Roles(Role.STUDENT)
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get my profile (STUDENT)' })
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.studentsService.getMyProfile(user);
  }

  @Get('me/classes')
  @Roles(Role.STUDENT)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'Get my classes and subjects (STUDENT)' })
  getMyClasses(@CurrentUser() user: AuthUser) {
    return this.studentsService.getMyClasses(user);
  }

  @Get('me/attendance')
  @Roles(Role.STUDENT)
  @Permissions(Permission.ATTENDANCE_READ)
  @ApiOperation({ summary: 'Get my attendance (STUDENT)' })
  getMyAttendance(@CurrentUser() user: AuthUser, @Query() query: QueryAttendanceDto) {
    return this.studentsService.getMyAttendance(user, query);
  }

  @Get('me/assignments')
  @Roles(Role.STUDENT)
  @Permissions(Permission.ASSIGNMENT_READ)
  @ApiOperation({ summary: 'Get my assignments (STUDENT)' })
  getMyAssignments(@CurrentUser() user: AuthUser, @Query() query: QueryAssignmentDto) {
    return this.studentsService.getMyAssignments(user, query);
  }

  @Get('me/exams')
  @Roles(Role.STUDENT)
  @Permissions(Permission.EXAM_READ)
  @ApiOperation({ summary: 'Get my exams (STUDENT)' })
  getMyExams(@CurrentUser() user: AuthUser, @Query() query: QueryExamDto) {
    return this.studentsService.getMyExams(user, query);
  }

  @Get('me/results')
  @Roles(Role.STUDENT)
  @Permissions(Permission.RESULT_READ)
  @ApiOperation({ summary: 'Get my results (STUDENT)' })
  getMyResults(@CurrentUser() user: AuthUser, @Query() query: QueryResultDto) {
    return this.studentsService.getMyResults(user, query);
  }

  @Get('me/notifications')
  @Roles(Role.STUDENT)
  @Permissions(Permission.NOTIFICATION_READ)
  @ApiOperation({ summary: 'Get my notifications (STUDENT)' })
  getMyNotifications(@CurrentUser() user: AuthUser, @Query() query: QueryNotificationDto) {
    return this.studentsService.getMyNotifications(user, query);
  }

  // Dashboard
  @Get('me/dashboard')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get student dashboard (STUDENT)' })
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.studentsService.getDashboard(user);
  }

  // =====================================================
  // ADMIN CRUD (declared after portal routes so /students/me
  // is never captured by the /students/:id parameter route)
  // =====================================================

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get a student by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studentsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_UPDATE)
  @ApiOperation({ summary: 'Update a student' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.STUDENT_DELETE)
  @ApiOperation({ summary: 'Delete a student' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studentsService.remove(user, id);
  }
}
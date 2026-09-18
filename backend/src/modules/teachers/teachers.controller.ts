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

import { TeachersService } from './teachers.service.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { QueryTeacherDto } from './dto/query-teacher.dto.js';
import { QueryAttendanceDto } from '../attendance/dto/query-attendance.dto.js';
import { MarkAttendanceDto } from '../attendance/dto/mark-attendance.dto.js';
import { QueryAssignmentDto } from '../assignments/dto/query-assignment.dto.js';
import { CreateAssignmentDto } from '../assignments/dto/create-assignment.dto.js';
import { UpdateAssignmentDto } from '../assignments/dto/update-assignment.dto.js';
import { GradeSubmissionDto } from '../assignments/dto/grade-submission.dto.js';
import { QueryResultDto } from '../results/dto/query-result.dto.js';
import { CreateResultDto } from '../results/dto/create-result.dto.js';
import { UpdateResultDto } from '../results/dto/update-result.dto.js';
import { QueryNotificationDto } from '../notifications/dto/query-notification.dto.js';

@ApiTags('Teachers')
@ApiBearerAuth()
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.TEACHER_CREATE)
  @ApiOperation({ summary: 'Create a teacher (profile + optional account)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTeacherDto) {
    return this.teachersService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.TEACHER_READ)
  @ApiOperation({ summary: 'List teachers (paginated, tenant-scoped)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryTeacherDto) {
    return this.teachersService.findAll(user, query);
  }

  // =====================================================
  // TEACHER PORTAL - MY DATA
  // =====================================================

  @Get('me')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get my profile (TEACHER)' })
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.teachersService.getMyProfile(user);
  }

  @Get('me/classes')
  @Roles(Role.TEACHER)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'Get my assigned classes (TEACHER)' })
  getMyClasses(@CurrentUser() user: AuthUser) {
    return this.teachersService.getMyClasses(user);
  }

  @Get('me/students')
  @Roles(Role.TEACHER)
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get my students (TEACHER)' })
  getMyStudents(@CurrentUser() user: AuthUser, @Query() query: QueryTeacherDto) {
    return this.teachersService.getMyStudents(user, query);
  }

  @Get('me/courses')
  @Roles(Role.TEACHER)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'Get my courses (TEACHER)' })
  getMyCourses(@CurrentUser() user: AuthUser) {
    return this.teachersService.getMyCourses(user);
  }

  // Attendance
  @Post('me/attendance')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ATTENDANCE_CREATE)
  @ApiOperation({ summary: 'Mark attendance for my class (TEACHER)' })
  markAttendance(@CurrentUser() user: AuthUser, @Body() dto: MarkAttendanceDto) {
    return this.teachersService.markAttendance(user, dto);
  }

  @Get('me/attendance')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ATTENDANCE_READ)
  @ApiOperation({ summary: 'Get my attendance records (TEACHER)' })
  getMyAttendance(@CurrentUser() user: AuthUser, @Query() query: QueryAttendanceDto) {
    return this.teachersService.getMyAttendance(user, query);
  }

  // Assignments
  @Get('me/assignments')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ASSIGNMENT_READ)
  @ApiOperation({ summary: 'Get my assignments (TEACHER)' })
  getMyAssignments(@CurrentUser() user: AuthUser, @Query() query: QueryAssignmentDto) {
    return this.teachersService.getMyAssignments(user, query);
  }

  @Post('me/assignments')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ASSIGNMENT_CREATE)
  @ApiOperation({ summary: 'Create an assignment (TEACHER)' })
  createAssignment(@CurrentUser() user: AuthUser, @Body() dto: CreateAssignmentDto) {
    return this.teachersService.createAssignment(user, dto);
  }

  @Patch('me/assignments/:id')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ASSIGNMENT_UPDATE)
  @ApiOperation({ summary: 'Update my assignment (TEACHER)' })
  updateAssignment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.teachersService.updateAssignment(user, id, dto);
  }

  @Delete('me/assignments/:id')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ASSIGNMENT_DELETE)
  @ApiOperation({ summary: 'Delete my assignment (TEACHER)' })
  deleteAssignment(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.teachersService.deleteAssignment(user, id);
  }

  @Get('me/assignments/:id/submissions')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ASSIGNMENT_READ)
  @ApiOperation({ summary: 'Get submissions for my assignment (TEACHER)' })
  getAssignmentSubmissions(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.teachersService.getAssignmentSubmissions(user, id);
  }

  @Patch('me/assignments/submissions/:submissionId/grade')
  @Roles(Role.TEACHER)
  @Permissions(Permission.ASSIGNMENT_UPDATE)
  @ApiOperation({ summary: 'Grade a submission (TEACHER)' })
  gradeSubmission(
    @CurrentUser() user: AuthUser,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.teachersService.gradeSubmission(user, submissionId, dto);
  }

  // Results
  @Get('me/results')
  @Roles(Role.TEACHER)
  @Permissions(Permission.RESULT_READ)
  @ApiOperation({ summary: 'Get my results (TEACHER)' })
  getMyResults(@CurrentUser() user: AuthUser, @Query() query: QueryResultDto) {
    return this.teachersService.getMyResults(user, query);
  }

  @Post('me/results')
  @Roles(Role.TEACHER)
  @Permissions(Permission.RESULT_CREATE)
  @ApiOperation({ summary: 'Create a result (TEACHER)' })
  createResult(@CurrentUser() user: AuthUser, @Body() dto: CreateResultDto) {
    return this.teachersService.createResult(user, dto);
  }

  @Patch('me/results/:id')
  @Roles(Role.TEACHER)
  @Permissions(Permission.RESULT_UPDATE)
  @ApiOperation({ summary: 'Update my result (TEACHER)' })
  updateResult(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateResultDto,
  ) {
    return this.teachersService.updateResult(user, id, dto);
  }

  // Notifications
  @Get('me/notifications')
  @Roles(Role.TEACHER)
  @Permissions(Permission.NOTIFICATION_READ)
  @ApiOperation({ summary: 'Get my notifications (TEACHER)' })
  getMyNotifications(@CurrentUser() user: AuthUser, @Query() query: QueryNotificationDto) {
    return this.teachersService.getMyNotifications(user, query);
  }

  // Dashboard
  @Get('me/dashboard')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get teacher dashboard (TEACHER)' })
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.teachersService.getDashboard(user);
  }

  // =====================================================
  // ADMIN CRUD (declared after portal routes so /teachers/me
  // is never captured by the /teachers/:id parameter route)
  // =====================================================

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.TEACHER_READ)
  @ApiOperation({ summary: 'Get a teacher by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.teachersService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.TEACHER_UPDATE)
  @ApiOperation({ summary: 'Update a teacher' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.TEACHER_DELETE)
  @ApiOperation({ summary: 'Delete a teacher' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.teachersService.remove(user, id);
  }
}
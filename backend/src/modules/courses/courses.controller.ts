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

import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.CLASS_CREATE)
  @ApiOperation({ summary: 'Create a course' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'List courses (teachers see their own)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryCourseDto) {
    return this.coursesService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.CLASS_READ)
  @ApiOperation({ summary: 'Get a course by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.coursesService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.CLASS_UPDATE)
  @ApiOperation({ summary: 'Update a course' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.CLASS_DELETE)
  @ApiOperation({ summary: 'Delete a course' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.coursesService.remove(user, id);
  }
}
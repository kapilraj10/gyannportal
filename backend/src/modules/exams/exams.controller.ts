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

import { ExamsService } from './exams.service.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';
import { QueryExamDto } from './dto/query-exam.dto.js';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.EXAM_CREATE)
  @ApiOperation({ summary: 'Create an exam' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateExamDto) {
    return this.examsService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.EXAM_READ)
  @ApiOperation({ summary: 'List exams' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryExamDto) {
    return this.examsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.EXAM_READ)
  @ApiOperation({ summary: 'Get an exam by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.examsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.EXAM_UPDATE)
  @ApiOperation({ summary: 'Update an exam' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.EXAM_DELETE)
  @ApiOperation({ summary: 'Delete an exam' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.examsService.remove(user, id);
  }
}
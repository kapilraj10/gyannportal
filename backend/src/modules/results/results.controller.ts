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

import { ResultsService } from './results.service.js';
import { CreateResultDto } from './dto/create-result.dto.js';
import { UpdateResultDto } from './dto/update-result.dto.js';
import { BulkCreateResultDto } from './dto/bulk-create-result.dto.js';
import { QueryResultDto } from './dto/query-result.dto.js';

@ApiTags('Results')
@ApiBearerAuth()
@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post('bulk')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.RESULT_CREATE)
  @ApiOperation({ summary: 'Bulk record results for an exam+subject' })
  bulkCreate(@CurrentUser() user: AuthUser, @Body() dto: BulkCreateResultDto) {
    return this.resultsService.bulkCreate(user, dto);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.RESULT_CREATE)
  @ApiOperation({ summary: 'Create a result' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateResultDto) {
    return this.resultsService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @Permissions(Permission.RESULT_READ)
  @ApiOperation({ summary: 'List results (role-scoped)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryResultDto) {
    return this.resultsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @Permissions(Permission.RESULT_READ)
  @ApiOperation({ summary: 'Get a result by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.resultsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Permissions(Permission.RESULT_UPDATE)
  @ApiOperation({ summary: 'Update a result' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateResultDto,
  ) {
    return this.resultsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.RESULT_UPDATE)
  @ApiOperation({ summary: 'Delete a result' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.resultsService.remove(user, id);
  }
}
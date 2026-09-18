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
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor.js';
import { Role } from '../../common/enums/role.enum.js';
import { Permission } from '../../common/enums/permission.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';

import { SchoolsService, type RequestMeta } from './schools.service.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { QuerySchoolDto } from './dto/query-school.dto.js';

function extractMeta(req: Request): RequestMeta {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

@ApiTags('Schools')
@ApiBearerAuth()
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @Permissions(Permission.SCHOOL_CREATE)
  @ApiOperation({ summary: 'Create a school (SUPER_ADMIN)' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSchoolDto,
    @Req() req: Request,
  ) {
    return this.schoolsService.create(user, dto, extractMeta(req));
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.SCHOOL_READ)
  @ApiOperation({ summary: 'List schools (scoped by tenant)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QuerySchoolDto) {
    return this.schoolsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.SCHOOL_READ)
  @ApiOperation({ summary: 'Get a school by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.schoolsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @Permissions(Permission.SCHOOL_UPDATE)
  @ApiOperation({ summary: 'Update a school (SUPER_ADMIN)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
    @Req() req: Request,
  ) {
    return this.schoolsService.update(user, id, dto, extractMeta(req));
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @Permissions(Permission.SCHOOL_DELETE)
  @ApiOperation({ summary: 'Delete a school (SUPER_ADMIN)' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.schoolsService.remove(user, id, extractMeta(req));
  }
}
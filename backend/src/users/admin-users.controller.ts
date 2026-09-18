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

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';
import { Role } from '../common/enums/role.enum.js';
import { Permission } from '../common/enums/permission.enum.js';
import type { AuthUser } from '../common/types/auth-user.js';

import { AdminUsersService } from './admin-users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.USER_CREATE)
  @ApiOperation({ summary: 'Create a user' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.adminUsersService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'List users (paginated, tenant-scoped)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryUserDto) {
    return this.adminUsersService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get a user by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.adminUsersService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.USER_UPDATE)
  @ApiOperation({ summary: 'Update a user' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminUsersService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Permissions(Permission.USER_DELETE)
  @ApiOperation({ summary: 'Delete a user' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.adminUsersService.remove(user, id);
  }
}
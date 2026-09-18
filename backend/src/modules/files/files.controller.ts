import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { multerOptions, MAX_FILE_SIZE } from '../../common/storage/multer.config.js';

import { FilesService } from './files.service.js';
import { QueryFileDto } from './dto/query-file.dto.js';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { category?: string },
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File exceeds the 10 MB limit');
    }
    return this.filesService.upload(user, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      filename: file.filename,
    }, body.category);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'List files' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryFileDto) {
    return this.filesService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'Get a file by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.filesService.findOne(user, id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'Delete a file' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.filesService.remove(user, id);
  }
}
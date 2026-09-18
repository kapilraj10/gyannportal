import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from '../../common/storage/multer.config.js';
import { Prisma } from '../../generated/prisma/client.js';
import { FileCategory } from '../../generated/prisma/client.js';
import { DatabaseService } from '../../database/database.service.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { getSkip, paginate } from '../../common/pagination/pagination.dto.js';

import { QueryFileDto } from './dto/query-file.dto.js';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
}

@Injectable()
export class FilesService {
  constructor(private readonly prisma: DatabaseService) {}

  async upload(
    user: AuthUser,
    file: UploadedFile,
    category?: string,
  ): Promise<{ message: string; data: unknown }> {
    const categoryValue = FileCategory[(category ?? 'OTHER') as FileCategory] ?? FileCategory.OTHER;

    const record = await this.prisma.mediaFile.create({
      data: {
        schoolId: user.schoolId,
        userId: user.userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageProvider: 'LOCAL',
        key: file.filename,
        url: `/uploads/${file.filename}`,
        category: categoryValue,
      },
    });

    return {
      message: 'File uploaded successfully',
      data: {
        id: record.id,
        originalName: record.originalName,
        mimeType: record.mimeType,
        size: record.size,
        url: record.url,
        category: record.category,
      },
    };
  }

  async findAll(user: AuthUser, query: QueryFileDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.MediaFileWhereInput = {};

    if (user.role === Role.SUPER_ADMIN) {
      if (query.userId) where.userId = query.userId;
    } else if (user.role === Role.SCHOOL_ADMIN) {
      where.schoolId = user.schoolId;
      if (query.userId) where.userId = query.userId;
    } else {
      where.userId = user.userId;
    }
    if (query.category) where.category = query.category;

    const [total, rows] = await Promise.all([
      this.prisma.mediaFile.count({ where }),
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
      }),
    ]);

    return paginate(rows, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('File not found');
    }
    if (user.role === Role.SUPER_ADMIN) {
      return { message: 'File fetched successfully', data: row };
    }
    if (user.role === Role.SCHOOL_ADMIN) {
      if (row.schoolId !== user.schoolId) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
      return { message: 'File fetched successfully', data: row };
    }
    if (row.userId !== user.userId) {
      throw new ForbiddenException('You do not own this file');
    }
    return { message: 'File fetched successfully', data: row };
  }

  async remove(user: AuthUser, id: string) {
    const row = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('File not found');
    }
    if (user.role === Role.SUPER_ADMIN) {
      // allowed
    } else if (user.role === Role.SCHOOL_ADMIN) {
      if (row.schoolId !== user.schoolId) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
    } else if (row.userId !== user.userId) {
      throw new ForbiddenException('You do not own this file');
    }

    await this.prisma.mediaFile.delete({ where: { id } });

    if (row.key) {
      const filePath = path.join(UPLOAD_DIR, row.key);
      unlink(filePath).catch(() => undefined);
    }

    return { message: 'File deleted successfully', data: null };
  }
}
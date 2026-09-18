import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return { message: 'Permissions fetched successfully', data: permissions };
  }

  async findGrouped() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    const grouped = permissions.reduce<Record<string, typeof permissions>>(
      (acc, permission) => {
        const group = permission.name.split('_')[0] ?? 'OTHER';
        acc[group] ??= [];
        acc[group].push(permission);
        return acc;
      },
      {},
    );

    return {
      message: 'Permissions fetched successfully',
      data: grouped,
    };
  }
}
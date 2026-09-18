import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { NotificationType } from '../../generated/prisma/client.js';
import { DatabaseService } from '../../database/database.service.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { getSkip, paginate } from '../../common/pagination/pagination.dto.js';

import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';

const NOTIFICATION_SELECT = {
  id: true,
  schoolId: true,
  senderId: true,
  recipientId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  createdAt: true,
  sender: { select: { id: true, name: true } },
} satisfies Prisma.NotificationSelect;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: DatabaseService) {}

  async send(user: AuthUser, dto: CreateNotificationDto) {
    const schoolId =
      user.role === Role.SUPER_ADMIN && dto.schoolId
        ? dto.schoolId
        : user.schoolId;

    let recipientIds: string[] = [];

    if (dto.recipientId) {
      recipientIds = [dto.recipientId];
    } else if (dto.recipientIds?.length) {
      recipientIds = dto.recipientIds;
    } else if (dto.classId) {
      const enrolled = await this.prisma.student.findMany({
        where: {
          schoolId,
          enrollments: { some: { classId: dto.classId } },
        },
        select: { userId: true },
      });
      recipientIds = enrolled.map((e) => e.userId);
    }

    if (!recipientIds.length) {
      throw new BadRequestException(
        'Provide recipientId, recipientIds or classId',
      );
    }

    const validUsers = await this.prisma.user.count({
      where: { id: { in: recipientIds }, schoolId },
    });
    if (validUsers !== recipientIds.length) {
      throw new BadRequestException(
        'One or more recipients are not found in this school',
      );
    }

    const type = dto.type ?? NotificationType.INFO;

    await this.prisma.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        schoolId,
        senderId: user.userId,
        recipientId,
        title: dto.title.trim(),
        message: dto.message.trim(),
        type,
      })),
    });

    return {
      message: 'Notification sent successfully',
      data: { recipientCount: recipientIds.length },
    };
  }

  async findAll(user: AuthUser, query: QueryNotificationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = { recipientId: user.userId };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const [total, rows] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: NOTIFICATION_SELECT,
      }),
    ]);

    const unread = await this.prisma.notification.count({
      where: { recipientId: user.userId, isRead: false },
    });

    return { ...paginate(rows, total, page, limit), unread };
  }

  async findOne(user: AuthUser, id: string) {
    const row = await this.prisma.notification.findFirst({
      where: { id, recipientId: user.userId },
      select: NOTIFICATION_SELECT,
    });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    return { message: 'Notification fetched successfully', data: row };
  }

  async markRead(user: AuthUser, id: string) {
    const row = await this.prisma.notification.findFirst({
      where: { id, recipientId: user.userId },
      select: { id: true },
    });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: NOTIFICATION_SELECT,
    });

    return { message: 'Notification marked as read', data: updated };
  }

  async markAllRead(user: AuthUser) {
    const result = await this.prisma.notification.updateMany({
      where: { recipientId: user.userId, isRead: false },
      data: { isRead: true },
    });

    return {
      message: 'All notifications marked as read',
      data: { count: result.count },
    };
  }
}
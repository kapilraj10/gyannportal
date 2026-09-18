import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

import { Prisma } from '../../generated/prisma/client.js';
import {
  BranchStatus,
  SchoolStatus,
  UserStatus,
} from '../../generated/prisma/client.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AuditAction } from '../../common/enums/audit-action.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { getSkip, paginate } from '../../common/pagination/pagination.dto.js';

import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { QuerySchoolDto } from './dto/query-school.dto.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

const SCHOOL_SELECT = {
  id: true,
  name: true,
  code: true,
  registrationNumber: true,
  schoolType: true,
  level: true,
  establishedYear: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  logo: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SchoolSelect;

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateSchoolDto, meta: RequestMeta = {}) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.school.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('School code already exists');
    }

    const adminEmail = dto.adminEmail?.trim().toLowerCase();
    if (adminEmail) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true },
      });
      if (existingUser) {
        throw new ConflictException('Admin email already exists');
      }
    }

    const passwordHash =
      adminEmail && dto.adminPassword
        ? await bcrypt.hash(dto.adminPassword, 12)
        : null;

    const result = await this.prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: dto.name.trim(),
          code,
          registrationNumber: dto.registrationNumber?.trim(),
          schoolType: dto.schoolType,
          level: dto.level,
          establishedYear: dto.establishedYear,
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          website: dto.website?.trim(),
          address: dto.address?.trim(),
          logo: dto.logo,
          status: dto.status ?? SchoolStatus.ACTIVE,
        },
        select: SCHOOL_SELECT,
      });

      let admin = null;

      if (adminEmail && passwordHash) {
        const role = await tx.role.upsert({
          where: { name: Role.SCHOOL_ADMIN },
          update: {},
          create: { name: Role.SCHOOL_ADMIN },
        });

        const branch = await tx.branch.create({
          data: {
            schoolId: school.id,
            name: 'Main Branch',
            status: BranchStatus.ACTIVE,
          },
          select: { id: true, name: true },
        });

        const created = await tx.user.create({
          data: {
            schoolId: school.id,
            branchId: branch.id,
            name: dto.adminName?.trim() || `${school.name} Admin`,
            email: adminEmail,
            phone: dto.adminPhone?.trim(),
            passwordHash,
            roleId: role.id,
            status: UserStatus.ACTIVE,
          },
          select: { id: true, name: true, email: true },
        });

        admin = created;
      }

      return { school, admin };
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: result.school.id,
      action: AuditAction.SCHOOL_CREATE,
      entity: 'School',
      entityId: result.school.id,
      metadata: { code: result.school.code, name: result.school.name },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      message: 'School created successfully',
      data: { ...result.school, admin: result.admin },
    };
  }

  async findAll(user: AuthUser, query: QuerySchoolDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.SchoolWhereInput = {};

    if (user.role !== Role.SUPER_ADMIN) {
      where.id = user.schoolId;
    }

    if (query.status) where.status = query.status;
    if (query.schoolType) where.schoolType = query.schoolType;
    if (query.level) where.level = query.level;

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, schools] = await Promise.all([
      this.prisma.school.count({ where }),
      this.prisma.school.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, limit),
        take: limit,
        select: {
          ...SCHOOL_SELECT,
          _count: {
            select: { users: true, students: true, teachers: true, parents: true },
          },
        },
      }),
    ]);

    return paginate(schools, total, page, limit);
  }

  async findOne(user: AuthUser, id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: {
        ...SCHOOL_SELECT,
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
            parents: true,
            classes: true,
            branches: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (user.role !== Role.SUPER_ADMIN && school.id !== user.schoolId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return { message: 'School fetched successfully', data: school };
  }

  async update(
    user: AuthUser,
    id: string,
    dto: UpdateSchoolDto,
    meta: RequestMeta = {},
  ) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.prisma.school.findFirst({
        where: { code, NOT: { id } },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException('School code already exists');
      }
    }

    const updated = await this.prisma.school.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        code: dto.code?.trim().toUpperCase(),
        registrationNumber: dto.registrationNumber?.trim(),
        schoolType: dto.schoolType,
        level: dto.level,
        establishedYear: dto.establishedYear,
        email: dto.email?.trim().toLowerCase(),
        phone: dto.phone?.trim(),
        website: dto.website?.trim(),
        address: dto.address?.trim(),
        logo: dto.logo,
        status: dto.status,
      },
      select: SCHOOL_SELECT,
    });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: id,
      action: AuditAction.SCHOOL_UPDATE,
      entity: 'School',
      entityId: id,
      metadata: { changes: Object.keys(dto) },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { message: 'School updated successfully', data: updated };
  }

  async remove(user: AuthUser, id: string, meta: RequestMeta = {}) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: { id: true, name: true, code: true },
    });
    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.prisma.school.delete({ where: { id } });

    await this.auditLogs.log({
      userId: user.userId,
      schoolId: id,
      action: AuditAction.SCHOOL_DELETE,
      entity: 'School',
      entityId: id,
      metadata: { name: school.name, code: school.code },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { message: 'School deleted successfully', data: null };
  }
}
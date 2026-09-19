import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import {
  BranchStatus,
  SchoolStatus,
  UserStatus,
} from '../generated/prisma/client.js';

import { DatabaseService } from '../database/database.service.js';
import { AuditLogsService } from '../modules/audit-logs/audit-logs.service.js';
import { AuditAction } from '../common/enums/audit-action.enum.js';

import { RegisterSchoolDto } from './dto/register-school.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

interface TokenUser {
  id: string;
  email: string;
  schoolId: string;
  roleId: string;
  roleName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  // =====================================================
  // REGISTER SCHOOL
  // =====================================================

  async registerSchool(dto: RegisterSchoolDto, meta: RequestMeta = {}) {
    const normalizedSchoolCode = dto.schoolCode.trim().toUpperCase();
    const normalizedAdminEmail = dto.adminEmail.trim().toLowerCase();

    const existingSchool = await this.prisma.school.findUnique({
      where: { code: normalizedSchoolCode },
    });

    if (existingSchool) {
      throw new ConflictException('School code already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedAdminEmail },
    });

    if (existingUser) {
      throw new ConflictException('Admin email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { name: 'SCHOOL_ADMIN' },
        update: {},
        create: { name: 'SCHOOL_ADMIN' },
      });

      const school = await tx.school.create({
        data: {
          name: dto.schoolName.trim(),
          code: normalizedSchoolCode,
          registrationNumber: dto.registrationNumber?.trim(),
          schoolType: dto.schoolType,
          level: dto.level,
          establishedYear: dto.establishedYear,
          email: dto.schoolEmail?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          website: dto.website?.trim(),
          address: dto.address?.trim(),
          status: SchoolStatus.ACTIVE,
        },
      });

      let branch = null;

      if (dto.branchName) {
        branch = await tx.branch.create({
          data: {
            schoolId: school.id,
            name: dto.branchName.trim(),
            address: dto.branchAddress?.trim(),
            status: BranchStatus.ACTIVE,
          },
        });
      }

      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          branchId: branch?.id,
          name: dto.adminName.trim(),
          email: normalizedAdminEmail,
          phone: dto.adminPhone?.trim(),
          passwordHash,
          roleId: role.id,
          status: UserStatus.ACTIVE,
        },
        include: { role: true, school: true, branch: true },
      });

      return { school, branch, user, role };
    });

    const tokens = await this.issueTokens({
      id: result.user.id,
      email: result.user.email,
      schoolId: result.school.id,
      roleId: result.role.id,
      roleName: result.role.name,
    });

    await this.auditLogs.log({
      userId: result.user.id,
      schoolId: result.school.id,
      action: AuditAction.SCHOOL_CREATE,
      entity: 'School',
      entityId: result.school.id,
      metadata: { code: result.school.code, name: result.school.name },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      message: 'School registered successfully',
      data: {
        ...tokens,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.role.name,
          roleId: result.role.id,
          schoolId: result.school.id,
          permissions: [],
          school: {
            id: result.school.id,
            name: result.school.name,
            code: result.school.code,
          },
          branch: result.branch
            ? { id: result.branch.id, name: result.branch.name }
            : null,
        },
      },
    };
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(dto: LoginDto, meta: RequestMeta = {}) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true, school: true, branch: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active');
    }

    if (user.school.status !== SchoolStatus.ACTIVE) {
      throw new UnauthorizedException('Your school account is not active');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      schoolId: user.schoolId,
      roleId: user.role.id,
      roleName: user.role.name,
    });

    const permissions = await this.getPermissionsForRole(user.role.id);

    await this.auditLogs.log({
      userId: user.id,
      schoolId: user.schoolId,
      action: AuditAction.AUTH_LOGIN,
      entity: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      message: 'Login successful',
      data: {
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role.name,
          roleId: user.role.id,
          status: user.status,
          schoolId: user.schoolId,
          permissions,
          school: {
            id: user.school.id,
            name: user.school.name,
            code: user.school.code,
            status: user.school.status,
          },
          branch: user.branch
            ? { id: user.branch.id, name: user.branch.name }
            : null,
        },
      },
    };
  }

  // =====================================================
  // REFRESH TOKEN
  // =====================================================

  async refresh(dto: RefreshTokenDto, userId: string, meta: RequestMeta = {}) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: { include: { role: true, school: true } },
      },
    });

    if (!stored || stored.userId !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens({
      id: stored.user.id,
      email: stored.user.email,
      schoolId: stored.user.schoolId,
      roleId: stored.user.role.id,
      roleName: stored.user.role.name,
    });

    await this.auditLogs.log({
      userId: stored.user.id,
      schoolId: stored.user.schoolId,
      action: AuditAction.AUTH_REFRESH,
      entity: 'RefreshToken',
      entityId: stored.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(userId: string, dto: LogoutDto, meta: RequestMeta = {}) {
    if (dto.refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: {
          tokenHash: this.hashToken(dto.refreshToken),
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await this.auditLogs.log({
      userId,
      action: AuditAction.AUTH_LOGOUT,
      entity: 'User',
      entityId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { message: 'Logged out successfully', data: null };
  }

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, school: true, branch: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = await this.getPermissionsForRole(user.roleId);

    return {
      message: 'Profile fetched successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        aboutMe: user.aboutMe,
        city: user.city,
        country: user.country,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        pushNotificationsEnabled: user.pushNotificationsEnabled,
        role: user.role.name,
        roleId: user.roleId,
        status: user.status,
        schoolId: user.schoolId,
        permissions,
        school: {
          id: user.school.id,
          name: user.school.name,
          code: user.school.code,
          status: user.school.status,
        },
        branch: user.branch
          ? { id: user.branch.id, name: user.branch.name }
          : null,
      },
    };
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, schoolId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditLogs.log({
      userId: user.id,
      schoolId: user.schoolId,
      action: AuditAction.AUTH_PASSWORD_CHANGE,
      entity: 'User',
      entityId: user.id,
    });

    return { message: 'Password changed successfully', data: null };
  }

  // =====================================================
  // TOKEN HELPERS
  // =====================================================

  /**
   * Resolve the permission names granted to a role. Used to decorate auth
   * responses so the frontend can apply `can()` checks without extra calls.
   */
  private async getPermissionsForRole(roleId: string): Promise<string[]> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        rolePermissions: {
          select: { permission: { select: { name: true } } },
        },
      },
    });

    return (role?.rolePermissions ?? []).map((rp) => rp.permission.name);
  }

  private async issueTokens(
    user: TokenUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        schoolId: user.schoolId,
        roleId: user.roleId,
        role: user.roleName,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ||
          '1d') as SignOptions['expiresIn'],
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'refresh', jti: randomUUID() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
          '30d') as SignOptions['expiresIn'],
      },
    );

    const decoded = this.jwtService.decode(refreshToken) as {
      exp?: number;
    } | null;

    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
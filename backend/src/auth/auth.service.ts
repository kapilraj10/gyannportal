import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';

import {
  BranchStatus,
  Role,
  SchoolStatus,
  UserStatus,
} from '../generated/prisma/client.js';

import { DatabaseService } from '../database/database.service.js';

import { RegisterSchoolDto } from './dto/register-school.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  // =====================================================
  // REGISTER SCHOOL
  // =====================================================

  async registerSchool(dto: RegisterSchoolDto) {
    const normalizedSchoolCode = dto.schoolCode.trim().toUpperCase();

    const normalizedAdminEmail = dto.adminEmail.trim().toLowerCase();

    // -----------------------------------------------------
    // CHECK SCHOOL CODE
    // -----------------------------------------------------

    const existingSchool = await this.prisma.school.findUnique({
      where: {
        code: normalizedSchoolCode,
      },
    });

    if (existingSchool) {
      throw new ConflictException('School code already exists');
    }

    // -----------------------------------------------------
    // CHECK ADMIN EMAIL
    // -----------------------------------------------------

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: normalizedAdminEmail,
      },
    });

    if (existingUser) {
      throw new ConflictException('Admin email already exists');
    }

    // -----------------------------------------------------
    // PASSWORD HASH
    // -----------------------------------------------------

    const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

    // -----------------------------------------------------
    // TRANSACTION
    // -----------------------------------------------------

    const result = await this.prisma.$transaction(async (tx) => {
      // ================================================
      // ROLE
      // ================================================

      const role = await tx.role.upsert({
        where: {
          name: 'SCHOOL_ADMIN',
        },
        update: {},
        create: {
          name: 'SCHOOL_ADMIN',
        },
      });

      // ================================================
      // SCHOOL
      // ================================================

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

      // ================================================
      // BRANCH
      // ================================================

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

      // ================================================
      // USER
      // ================================================

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
        include: {
          role: true,
          school: true,
          branch: true,
        },
      });

      return {
        school,
        branch,
        user,
        role,
      };
    });

    // -----------------------------------------------------
    // JWT
    // -----------------------------------------------------

    const token = await this.generateToken(
      result.user.id,
      result.user.email,
      result.school.id,
      result.role,
    );

    return {
      message: 'School registered successfully',
      accessToken: token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.role.name,
        schoolId: result.school.id,
        school: {
          id: result.school.id,
          name: result.school.name,
          code: result.school.code,
        },
        branch: result.branch
          ? {
              id: result.branch.id,
              name: result.branch.name,
            }
          : null,
      },
    };
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    // -----------------------------------------------------
    // FIND USER
    // -----------------------------------------------------

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
        school: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // -----------------------------------------------------
    // CHECK PASSWORD
    // -----------------------------------------------------

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // -----------------------------------------------------
    // CHECK USER STATUS
    // -----------------------------------------------------

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active');
    }

    // -----------------------------------------------------
    // CHECK SCHOOL STATUS
    // -----------------------------------------------------

    if (user.school.status !== SchoolStatus.ACTIVE) {
      throw new UnauthorizedException('Your school account is not active');
    }

    // -----------------------------------------------------
    // JWT
    // -----------------------------------------------------

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.schoolId,
      user.role,
    );

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        schoolId: user.schoolId,
        school: {
          id: user.school.id,
          name: user.school.name,
          code: user.school.code,
          status: user.school.status,
        },
        branch: user.branch
          ? {
              id: user.branch.id,
              name: user.branch.name,
            }
          : null,
      },
    };
  }

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
        school: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      status: user.status,
      school: {
        id: user.school.id,
        name: user.school.name,
        code: user.school.code,
        status: user.school.status,
      },
      branch: user.branch
        ? {
            id: user.branch.id,
            name: user.branch.name,
          }
        : null,
    };
  }

  // =====================================================
  // JWT GENERATOR
  // =====================================================

  private async generateToken(
    userId: string,
    email: string,
    schoolId: string,
    role: Role,
  ) {
    const payload = {
      sub: userId,
      email,
      schoolId,
      roleId: role.id,
      role: role.name,
    };

    return this.jwtService.signAsync(payload);
  }
}
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SchoolLevel, SchoolType } from '../../generated/prisma/client.js';

export class RegisterSchoolDto {
  // ================================
  // SCHOOL
  // ================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  schoolName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message:
      'School code can only contain letters, numbers, hyphens and underscores',
  })
  schoolCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @IsOptional()
  @IsEnum(SchoolType)
  schoolType?: SchoolType;

  @IsOptional()
  @IsEnum(SchoolLevel)
  level?: SchoolLevel;

  @IsOptional()
  @IsInt()
  establishedYear?: number;

  @IsOptional()
  @IsEmail()
  schoolEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // ================================
  // SCHOOL ADMIN
  // ================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @IsOptional()
  @IsString()
  adminPhone?: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;

  // ================================
  // BRANCH
  // ================================

  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @IsOptional()
  @IsString()
  branchAddress?: string;
}
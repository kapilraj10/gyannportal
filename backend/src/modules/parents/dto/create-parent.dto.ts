import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  Gender,
  ParentChildRelationship,
  ParentStatus,
} from '../../../generated/prisma/client.js';

export class ParentChildDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsEnum(ParentChildRelationship)
  relationship?: ParentChildRelationship;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateParentDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(ParentStatus)
  status?: ParentStatus;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  children?: ParentChildDto[];

  @IsOptional()
  @IsString()
  schoolId?: string;
}
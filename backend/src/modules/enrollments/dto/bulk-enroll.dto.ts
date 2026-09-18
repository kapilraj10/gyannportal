import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EnrollmentStatus } from '../../../generated/prisma/client.js';

export class BulkEnrollDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  studentIds: string[];

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsString()
  schoolId?: string;
}
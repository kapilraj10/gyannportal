import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class AttendanceRecordDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}

export class MarkAttendanceDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsDateString()
  date: string;

  @IsArray()
  @IsObject({ each: true })
  records: AttendanceRecordDto[];

  @IsOptional()
  @IsString()
  schoolId?: string;
}
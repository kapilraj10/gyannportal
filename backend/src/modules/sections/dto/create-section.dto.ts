import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SectionStatus } from '../../../generated/prisma/client.js';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsEnum(SectionStatus)
  status?: SectionStatus;

  @IsOptional()
  @IsString()
  schoolId?: string;
}
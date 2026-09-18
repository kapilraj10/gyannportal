import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AssignmentSubmissionStatus } from '../../../generated/prisma/client.js';

export class GradeSubmissionDto {
  @IsNumber()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsEnum(AssignmentSubmissionStatus)
  status?: AssignmentSubmissionStatus;
}
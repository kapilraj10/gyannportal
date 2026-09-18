import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExamStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QueryExamDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @IsOptional()
  @IsString()
  academicYearId?: string;
}
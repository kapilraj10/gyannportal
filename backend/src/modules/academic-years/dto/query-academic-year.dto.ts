import { IsEnum, IsOptional } from 'class-validator';
import { AcademicYearStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QueryAcademicYearDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AcademicYearStatus)
  status?: AcademicYearStatus;
}
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClassStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QueryClassDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;

  @IsOptional()
  @IsString()
  academicYearId?: string;
}
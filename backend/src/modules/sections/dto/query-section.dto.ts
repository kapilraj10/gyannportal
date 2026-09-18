import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SectionStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QuerySectionDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SectionStatus)
  status?: SectionStatus;

  @IsOptional()
  @IsString()
  classId?: string;
}
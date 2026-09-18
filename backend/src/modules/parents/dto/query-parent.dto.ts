import { IsEnum, IsOptional } from 'class-validator';
import { ParentStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QueryParentDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ParentStatus)
  status?: ParentStatus;
}
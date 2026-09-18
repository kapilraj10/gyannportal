import { IsEnum, IsOptional } from 'class-validator';
import { BranchStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QueryBranchDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;
}
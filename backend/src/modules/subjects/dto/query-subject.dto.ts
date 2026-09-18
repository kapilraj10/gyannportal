import { IsEnum, IsOptional } from 'class-validator';
import { SubjectStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QuerySubjectDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;
}
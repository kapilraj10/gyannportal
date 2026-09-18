import { IsEnum, IsOptional } from 'class-validator';
import { TeacherStatus } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QueryTeacherDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;
}
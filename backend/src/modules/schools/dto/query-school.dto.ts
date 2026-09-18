import { IsEnum, IsOptional } from 'class-validator';
import {
  SchoolLevel,
  SchoolStatus,
  SchoolType,
} from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../../common/pagination/pagination.dto.js';

export class QuerySchoolDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SchoolStatus)
  status?: SchoolStatus;

  @IsOptional()
  @IsEnum(SchoolType)
  schoolType?: SchoolType;

  @IsOptional()
  @IsEnum(SchoolLevel)
  level?: SchoolLevel;
}
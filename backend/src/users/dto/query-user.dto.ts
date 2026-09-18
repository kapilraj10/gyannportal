import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../common/pagination/pagination.dto.js';
import { Role } from '../../common/enums/role.enum.js';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  branchId?: string;
}
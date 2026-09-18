import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissionIds: string[];
}
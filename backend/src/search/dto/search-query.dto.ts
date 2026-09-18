import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsIn(['posts', 'comments', 'communities', 'people'], {
    message: 'type must be posts, comments, communities or people',
  })
  type?: 'posts' | 'comments' | 'communities' | 'people';

  @IsOptional()
  @IsUUID()
  communityId?: string;
}
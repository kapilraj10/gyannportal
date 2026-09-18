import { IsIn, IsOptional, IsString } from 'class-validator';

export class CommunityPostsQueryDto {
  @IsOptional()
  @IsIn(['new', 'hot'], { message: 'sort must be either new or hot' })
  sort?: 'new' | 'hot';
}

export class ListCommunitiesQueryDto {
  @IsOptional()
  @IsIn(['all', 'joined'], { message: 'filter must be either all or joined' })
  filter?: 'all' | 'joined';
}

export class NameParamDto {
  @IsString()
  name: string;
}
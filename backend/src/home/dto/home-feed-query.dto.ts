import { IsIn, IsOptional } from 'class-validator';

export class HomeFeedQueryDto {
  @IsOptional()
  @IsIn(['new', 'hot'], { message: 'sort must be either new or hot' })
  sort?: 'new' | 'hot';
}
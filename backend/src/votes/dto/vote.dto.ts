import { IsEnum, IsIn, IsString, IsUUID } from 'class-validator';
import { VoteTarget } from '../../generated/prisma/client.js';

export class VoteDto {
  @IsEnum(VoteTarget)
  targetType: VoteTarget;

  @IsUUID()
  targetId: string;

  @IsIn([1, -1], { message: 'value must be either 1 (upvote) or -1 (downvote)' })
  value: 1 | -1;
}
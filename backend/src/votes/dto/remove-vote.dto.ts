import { IsEnum, IsString, IsUUID } from 'class-validator';
import { VoteTarget } from '../../generated/prisma/client.js';

export class RemoveVoteDto {
  @IsEnum(VoteTarget)
  targetType: VoteTarget;

  @IsUUID()
  targetId: string;
}
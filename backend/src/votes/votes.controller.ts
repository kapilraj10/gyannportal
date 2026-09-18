import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { VotesService } from './votes.service.js';
import { VoteDto } from './dto/vote.dto.js';
import { RemoveVoteDto } from './dto/remove-vote.dto.js';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  // =====================================================
  // POST /votes
  // =====================================================

  @Post()
  vote(@CurrentUser() user: AuthUser, @Body() dto: VoteDto) {
    return this.votesService.toggleVote(user, dto);
  }

  // =====================================================
  // DELETE /votes
  // =====================================================

  @Delete()
  unvote(@CurrentUser() user: AuthUser, @Body() dto: RemoveVoteDto) {
    return this.votesService.removeVote(user, dto.targetType, dto.targetId);
  }
}
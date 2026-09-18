import { Injectable, NotFoundException } from '@nestjs/common';

import { VoteTarget } from '../generated/prisma/client.js';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';

import { VoteDto } from './dto/vote.dto.js';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: DatabaseService) {}

  // =====================================================
  // TOGGLE VOTE (Reddit-style)
  //
  //  - no existing vote             -> create it
  //  - existing vote, same value    -> remove it (undo)
  //  - existing vote, other value   -> flip it
  // =====================================================

  async toggleVote(user: AuthUser, dto: VoteDto) {
    await this.assertTargetExists(user.schoolId, dto.targetType, dto.targetId);

    const existing = await this.prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
    });

    let score: number;

    if (!existing) {
      score = await this.applyVote(user, dto.targetType, dto.targetId, dto.value, 0);
    } else if (existing.value === dto.value) {
      score = await this.removeVote(user, dto.targetType, dto.targetId);
    } else {
      score = await this.applyVote(user, dto.targetType, dto.targetId, dto.value, existing.value);
    }

    return { score, userVote: dto.value };
  }

  // =====================================================
  // REMOVE VOTE
  // =====================================================

  async removeVote(user: AuthUser, targetType: VoteTarget, targetId: string) {
    const existing = await this.prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.userId,
          targetType,
          targetId,
        },
      },
    });

    if (!existing) {
      return this.getScore(targetType, targetId);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.vote.delete({
        where: {
          userId_targetType_targetId: {
            userId: user.userId,
            targetType,
            targetId,
          },
        },
      });

      return this.adjustScore(tx, targetType, targetId, -existing.value);
    });
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private async applyVote(
    user: AuthUser,
    targetType: VoteTarget,
    targetId: string,
    newValue: number,
    oldValue: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.vote.upsert({
        where: {
          userId_targetType_targetId: {
            userId: user.userId,
            targetType,
            targetId,
          },
        },
        update: { value: newValue },
        create: {
          schoolId: user.schoolId,
          userId: user.userId,
          targetType,
          targetId,
          value: newValue,
        },
      });

      const delta = newValue - oldValue;

      return this.adjustScore(tx, targetType, targetId, delta);
    });
  }

  private async adjustScore(
    tx: Pick<DatabaseService, 'post' | 'comment'>,
    targetType: VoteTarget,
    targetId: string,
    delta: number,
  ) {
    if (targetType === VoteTarget.POST) {
      const updated = await tx.post.update({
        where: { id: targetId },
        data: { score: { increment: delta } },
        select: { score: true },
      });

      return updated.score;
    }

    const updated = await tx.comment.update({
      where: { id: targetId },
      data: { score: { increment: delta } },
      select: { score: true },
    });

    return updated.score;
  }

  private async assertTargetExists(
    schoolId: string,
    targetType: VoteTarget,
    targetId: string,
  ) {
    if (targetType === VoteTarget.POST) {
      const post = await this.prisma.post.findFirst({
        where: { id: targetId, schoolId },
        select: { id: true },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return;
    }

    const comment = await this.prisma.comment.findFirst({
      where: { id: targetId, schoolId },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
  }

  private async getScore(targetType: VoteTarget, targetId: string) {
    if (targetType === VoteTarget.POST) {
      const post = await this.prisma.post.findUnique({
        where: { id: targetId },
        select: { score: true },
      });

      return post?.score ?? 0;
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: targetId },
      select: { score: true },
    });

    return comment?.score ?? 0;
  }
}
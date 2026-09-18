import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { VoteTarget } from '../generated/prisma/client.js';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';
import { getVoteMap } from '../common/helpers/votes.helper.js';

import { CreateCommentDto } from './dto/create-comment.dto.js';

export interface CommentNode {
  id: string;
  content: string;
  score: number;
  createdAt: Date;
  parentId: string | null;
  userVote: number | null;
  author: { id: string; name: string; avatar: string | null };
  children: CommentNode[];
}

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: DatabaseService) {}

  // =====================================================
  // CREATE
  // =====================================================

  async create(user: AuthUser, dto: CreateCommentDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: dto.postId, schoolId: user.schoolId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, postId: dto.postId, schoolId: user.schoolId },
        select: { id: true },
      });

      if (!parent) {
        throw new BadRequestException('Parent comment not found in this post');
      }
    }

    return this.prisma.comment.create({
      data: {
        schoolId: user.schoolId,
        postId: dto.postId,
        parentId: dto.parentId ?? null,
        authorId: user.userId,
        content: dto.content.trim(),
      },
      select: {
        id: true,
        content: true,
        score: true,
        parentId: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  // =====================================================
  // LIST A POST'S COMMENTS (threaded)
  // =====================================================

  async listByPost(user: AuthUser, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, schoolId: user.schoolId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId, schoolId: user.schoolId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        score: true,
        parentId: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    const voteMap = await getVoteMap(
      this.prisma,
      user.userId,
      VoteTarget.COMMENT,
      comments.map((comment) => comment.id),
    );

    return this.buildTree(comments, voteMap);
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private buildTree(
    comments: Array<Omit<CommentNode, 'userVote' | 'children'>>,
    voteMap: Map<string, number>,
  ) {
    const nodes = new Map<string, CommentNode>();

    for (const comment of comments) {
      nodes.set(comment.id, {
        ...comment,
        userVote: voteMap.get(comment.id) ?? null,
        children: [],
      });
    }

    const roots: CommentNode[] = [];

    for (const comment of comments) {
      const node = nodes.get(comment.id)!;

      if (comment.parentId && nodes.has(comment.parentId)) {
        nodes.get(comment.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
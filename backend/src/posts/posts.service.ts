import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { VoteTarget } from '../generated/prisma/client.js';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';
import { getVoteMap } from '../common/helpers/votes.helper.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { PostMapper } from './post.mapper.js';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly postMapper: PostMapper,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  async create(user: AuthUser, dto: CreatePostDto) {
    const community = await this.prisma.community.findFirst({
      where: { id: dto.communityId, schoolId: user.schoolId },
      select: { id: true },
    });

    if (!community) {
      throw new BadRequestException('Community not found in your school');
    }

    const post = await this.prisma.post.create({
      data: {
        schoolId: user.schoolId,
        communityId: community.id,
        authorId: user.userId,
        title: dto.title.trim(),
        content: dto.content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true, title: true } },
        _count: { select: { comments: true } },
      },
    });

    return {
      ...this.postMapper.map([post])[0],
      userVote: null,
    };
  }

  // =====================================================
  // GET BY ID
  // =====================================================

  async getById(user: AuthUser, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, schoolId: user.schoolId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true, title: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const voteMap = await getVoteMap(
      this.prisma,
      user.userId,
      VoteTarget.POST,
      [post.id],
    );

    return {
      ...this.postMapper.map([post])[0],
      userVote: voteMap.get(post.id) ?? null,
    };
  }
}
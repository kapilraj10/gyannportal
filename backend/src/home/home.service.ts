import { Injectable } from '@nestjs/common';

import { VoteTarget } from '../generated/prisma/client.js';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';
import { getVoteMap, attachUserVotes } from '../common/helpers/votes.helper.js';
import { PostMapper } from '../posts/post.mapper.js';

import { HomeFeedQueryDto } from './dto/home-feed-query.dto.js';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly postMapper: PostMapper,
  ) {}

  // =====================================================
  // FEED (posts from followed communities)
  // =====================================================

  async getFeed(user: AuthUser, query: HomeFeedQueryDto) {
    const where = { schoolId: user.schoolId };

    const orderBy =
      query.sort === 'hot'
        ? ([{ score: 'desc' }, { createdAt: 'desc' }] as const)
        : ([{ createdAt: 'desc' }] as const);

    const posts = await this.prisma.post.findMany({
      where: {
        schoolId: user.schoolId,
        community: {
          members: { some: { userId: user.userId } },
        },
      },
      orderBy: [...orderBy],
      take: 50,
      select: this.postMapper.buildSelect(user.userId).select,
    });

    const voteMap = await getVoteMap(
      this.prisma,
      user.userId,
      VoteTarget.POST,
      posts.map((post) => post.id),
    );

    const subscribed = await this.prisma.community.findMany({
      where: { ...where, members: { some: { userId: user.userId } } },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        type: true,
        color: true,
        _count: { select: { members: true, posts: true } },
      },
    });

    const suggestions = await this.prisma.community.findMany({
      where: {
        ...where,
        members: { none: { userId: user.userId } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        type: true,
        color: true,
        _count: { select: { members: true, posts: true } },
      },
    });

    return {
      posts: attachUserVotes(this.postMapper.map(posts), voteMap),
      subscribedCommunities: subscribed.map((community) => ({
        id: community.id,
        name: community.name,
        title: community.title,
        type: community.type,
        color: community.color,
        memberCount: community._count.members,
        postCount: community._count.posts,
        isMember: true,
      })),
      suggestions: suggestions.map((community) => ({
        id: community.id,
        name: community.name,
        title: community.title,
        description: community.description,
        type: community.type,
        color: community.color,
        memberCount: community._count.members,
        postCount: community._count.posts,
        isMember: false,
      })),
    };
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';

import { VoteTarget } from '../generated/prisma/client.js';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';
import { getVoteMap, attachUserVotes } from '../common/helpers/votes.helper.js';
import { PostMapper } from '../posts/post.mapper.js';

import { SearchQueryDto } from './dto/search-query.dto.js';

const SEARCH_LIMIT = 20;

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly postMapper: PostMapper,
  ) {}

  async search(user: AuthUser, query: SearchQueryDto) {
    const q = query.q.trim();

    if (!q) {
      throw new NotFoundException('Search query is required');
    }

    if (query.communityId) {
      const community = await this.prisma.community.findFirst({
        where: { id: query.communityId, schoolId: user.schoolId },
        select: { id: true },
      });

      if (!community) {
        throw new NotFoundException('Community not found');
      }
    }

    const type = query.type ?? 'posts';

    const results: Record<string, unknown> = {
      query: q,
      type,
    };

    if (type === 'posts' || type === 'comments') {
      results[type] = await this.searchContent(user, q, type, query.communityId);
    } else if (type === 'communities') {
      results.communities = await this.searchCommunities(user, q);
    } else {
      results.people = await this.searchPeople(user, q);
    }

    return results;
  }

  // =====================================================
  // CONTENT (posts / comments)
  // =====================================================

  private async searchContent(
    user: AuthUser,
    q: string,
    type: 'posts' | 'comments',
    communityId?: string,
  ) {
    if (type === 'posts') {
      const communityWhere = communityId
        ? { communityId: { equals: communityId } }
        : {};

      const posts = await this.prisma.post.findMany({
        where: {
          schoolId: user.schoolId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
          ...communityWhere,
        },
        take: SEARCH_LIMIT,
        select: this.postMapper.buildSelect(user.userId).select,
      });

      const voteMap = await getVoteMap(
        this.prisma,
        user.userId,
        VoteTarget.POST,
        posts.map((post) => post.id),
      );

      return attachUserVotes(this.postMapper.map(posts), voteMap);
    }

    const comments = await this.prisma.comment.findMany({
      where: {
        schoolId: user.schoolId,
        content: { contains: q, mode: 'insensitive' },
        ...(communityId ? { post: { communityId } } : {}),
      },
      take: SEARCH_LIMIT,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        score: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatar: true } },
        post: {
          select: {
            id: true,
            title: true,
            community: { select: { id: true, name: true, title: true } },
          },
        },
      },
    });

    const voteMap = await getVoteMap(
      this.prisma,
      user.userId,
      VoteTarget.COMMENT,
      comments.map((comment) => comment.id),
    );

    return attachUserVotes(comments, voteMap);
  }

  // =====================================================
  // COMMUNITIES
  // =====================================================

  private async searchCommunities(user: AuthUser, q: string) {
    const communities = await this.prisma.community.findMany({
      where: {
        schoolId: user.schoolId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: SEARCH_LIMIT,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        type: true,
        color: true,
        createdAt: true,
        _count: { select: { members: true, posts: true } },
        members: {
          where: { userId: user.userId },
          select: { role: true, joinedAt: true },
        },
      },
    });

    return communities.map((community) => ({
      id: community.id,
      name: community.name,
      title: community.title,
      description: community.description,
      type: community.type,
      color: community.color,
      memberCount: community._count.members,
      postCount: community._count.posts,
      isMember: community.members.length > 0,
      memberRole: community.members[0]?.role ?? null,
      joinedAt: community.members[0]?.joinedAt ?? null,
    }));
  }

  // =====================================================
  // PEOPLE
  // =====================================================

  private async searchPeople(user: AuthUser, q: string) {
    const people = await this.prisma.user.findMany({
      where: {
        schoolId: user.schoolId,
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
          { id: { not: user.userId } },
        ],
      },
      take: SEARCH_LIMIT,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: { select: { name: true } },
      },
    });

    return people.map((person) => ({
      id: person.id,
      name: person.name,
      email: person.email,
      avatar: person.avatar,
      role: person.role.name,
    }));
  }
}
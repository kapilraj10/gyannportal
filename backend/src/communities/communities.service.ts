import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import {
  CommunityMemberRole,
  CommunityType,
  Prisma,
  VoteTarget,
} from '../generated/prisma/client.js';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';
import { getVoteMap, attachUserVotes } from '../common/helpers/votes.helper.js';
import { PostMapper } from '../posts/post.mapper.js';

import { CreateCommunityDto } from './dto/create-community.dto.js';
import { CommunityPostsQueryDto, ListCommunitiesQueryDto } from './dto/community-queries.dto.js';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly postMapper: PostMapper,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  async create(user: AuthUser, dto: CreateCommunityDto) {
    const name = dto.name.toLowerCase().trim();

    const existing = await this.prisma.community.findUnique({
      where: { schoolId_name: { schoolId: user.schoolId, name } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('A community with this name already exists');
    }

    const community = await this.prisma.$transaction(async (tx) => {
      const created = await tx.community.create({
        data: {
          schoolId: user.schoolId,
          name,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          type: dto.type ?? 'PUBLIC',
          color: dto.color ?? null,
          createdById: user.userId,
        },
      });

      await tx.communityMember.create({
        data: {
          communityId: created.id,
          userId: user.userId,
          role: CommunityMemberRole.OWNER,
        },
      });

      return created;
    });

    return this.getCommunity(user, community);
  }

  // =====================================================
  // LIST
  // =====================================================

  async list(user: AuthUser, query: ListCommunitiesQueryDto) {
    const where: Prisma.CommunityWhereInput = { schoolId: user.schoolId };

    if (query.filter === 'joined') {
      where.members = { some: { userId: user.userId } };
    }

    const communities = await this.prisma.community.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        type: true,
        color: true,
        createdAt: true,
        _count: {
          select: { members: true, posts: true },
        },
        members: {
          where: { userId: user.userId },
          select: { role: true, joinedAt: true },
        },
      },
    });

    return this.mapCommunityList(communities);
  }

  // =====================================================
  // GET BY NAME
  // =====================================================

  async getByName(user: AuthUser, name: string) {
    const community = await this.findCommunityOrThrow(user.schoolId, name.toLowerCase());

    return this.getCommunity(user, community);
  }

  // =====================================================
  // JOIN / LEAVE
  // =====================================================

  async join(user: AuthUser, name: string) {
    const community = await this.findCommunityOrThrow(user.schoolId, name.toLowerCase());

    const membership = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: user.userId,
        },
      },
    });

    if (!membership) {
      await this.prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: user.userId,
        },
      });
    }

    return this.getCommunity(user, community);
  }

  async leave(user: AuthUser, name: string) {
    const community = await this.findCommunityOrThrow(user.schoolId, name.toLowerCase());

    await this.prisma.communityMember.deleteMany({
      where: {
        communityId: community.id,
        userId: user.userId,
        role: { not: CommunityMemberRole.OWNER },
      },
    });

    return this.getCommunity(user, community);
  }

  // =====================================================
  // COMMUNITY POSTS FEED
  // =====================================================

  async getPosts(
    user: AuthUser,
    name: string,
    query: CommunityPostsQueryDto,
  ) {
    const community = await this.findCommunityOrThrow(user.schoolId, name.toLowerCase());

    const orderBy =
      query.sort === 'hot'
        ? ([{ score: 'desc' }, { createdAt: 'desc' }] as const)
        : ([{ createdAt: 'desc' }] as const);

    const posts = await this.prisma.post.findMany({
      where: { communityId: community.id, schoolId: user.schoolId },
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

    return {
      community: {
        id: community.id,
        name: community.name,
        title: community.title,
        description: community.description,
        type: community.type,
      },
      posts: attachUserVotes(this.postMapper.map(posts), voteMap),
      total: posts.length,
    };
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private async findCommunityOrThrow(schoolId: string, name: string) {
    const community = await this.prisma.community.findUnique({
      where: { schoolId_name: { schoolId, name } },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  private async getCommunity(user: AuthUser, community: {
    id: string;
    name: string;
    title: string;
    description: string | null;
    type: CommunityType;
    color: string | null;
    createdAt: Date;
    creator?: { id: string; name: string; avatar: string | null } | undefined;
  }) {
    const [membership, memberCount, postCount] = await Promise.all([
      this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId: user.userId,
          },
        },
        select: { role: true, joinedAt: true },
      }),
      this.prisma.communityMember.count({
        where: { communityId: community.id },
      }),
      this.prisma.post.count({
        where: { communityId: community.id },
      }),
    ]);

    return {
      id: community.id,
      name: community.name,
      title: community.title,
      description: community.description,
      type: community.type,
      color: community.color,
      createdAt: community.createdAt,
      isMember: Boolean(membership),
      memberRole: membership?.role ?? null,
      joinedAt: membership?.joinedAt ?? null,
      memberCount,
      postCount,
      creator: community.creator ?? null,
    };
  }

  private mapCommunityList(
    communities: Array<{
      id: string;
      name: string;
      title: string;
      description: string | null;
      type: CommunityType;
      color: string | null;
      createdAt: Date;
      _count: { members: number; posts: number };
      members: Array<{ role: CommunityMemberRole; joinedAt: Date }>;
    }>,
  ) {
    return communities.map((community) => ({
      id: community.id,
      name: community.name,
      title: community.title,
      description: community.description,
      type: community.type,
      color: community.color,
      createdAt: community.createdAt,
      memberCount: community._count.members,
      postCount: community._count.posts,
      isMember: community.members.length > 0,
      memberRole: community.members[0]?.role ?? null,
      joinedAt: community.members[0]?.joinedAt ?? null,
    }));
  }
}
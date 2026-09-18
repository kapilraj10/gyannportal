import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { DatabaseService } from '../database/database.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DatabaseService) {}

  // =====================================================
  // GET MY PROFILE
  // =====================================================

  async getMyProfile(user: AuthUser) {
    const profile = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        gender: true,
        aboutMe: true,
        city: true,
        country: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        status: true,
        role: { select: { name: true } },
        school: { select: { id: true, name: true, code: true, status: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!profile) {
      throw new UnauthorizedException('User not found');
    }

    const karma = await this.getKarmaTotals(user.userId, user.schoolId);

    return {
      ...profile,
      role: profile.role.name,
      karma: karma.totals,
    };
  }

  // =====================================================
  // UPDATE MY PROFILE (SETTINGS)
  // =====================================================

  async updateProfile(user: AuthUser, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id: user.userId },
      data: dto,
    });

    return this.getMyProfile(user);
  }

  // =====================================================
  // GET PUBLIC PROFILE
  // =====================================================

  async getPublicProfile(targetUserId: string, schoolId: string) {
    const profile = await this.prisma.user.findFirst({
      where: { id: targetUserId, schoolId },
      select: {
        id: true,
        name: true,
        avatar: true,
        aboutMe: true,
        city: true,
        country: true,
        createdAt: true,
        role: { select: { name: true } },
        posts: {
          where: { schoolId },
          select: { id: true },
        },
        comments: {
          where: { schoolId },
          select: { id: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const karma = await this.getKarmaTotals(targetUserId, schoolId);

    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      aboutMe: profile.aboutMe,
      city: profile.city,
      country: profile.country,
      role: profile.role.name,
      joinedAt: profile.createdAt,
      postCount: profile.posts.length,
      commentCount: profile.comments.length,
      karma: {
        postKarma: karma.totals.postKarma,
        commentKarma: karma.totals.commentKarma,
        total: karma.totals.postKarma + karma.totals.commentKarma,
      },
    };
  }

  // =====================================================
  // KARMA
  // =====================================================

  async getKarmaBreakdown(targetUserId: string, schoolId: string) {
    await this.assertUserExists(targetUserId, schoolId);

    const [posts, comments] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: targetUserId, schoolId },
        select: {
          score: true,
          communityId: true,
        },
      }),
      this.prisma.comment.findMany({
        where: { authorId: targetUserId, schoolId },
        select: {
          score: true,
          post: {
            select: {
              communityId: true,
            },
          },
        },
      }),
    ]);

    const byCommunity = new Map<string, { postKarma: number; commentKarma: number }>();

    const addCommunity = (communityId: string) => {
      if (!byCommunity.has(communityId)) {
        byCommunity.set(communityId, { postKarma: 0, commentKarma: 0 });
      }
    };

    for (const post of posts) {
      addCommunity(post.communityId);
      byCommunity.get(post.communityId)!.postKarma += post.score;
    }

    for (const comment of comments) {
      const communityId = comment.post.communityId;
      addCommunity(communityId);
      byCommunity.get(communityId)!.commentKarma += comment.score;
    }

    const communityIds = [...byCommunity.keys()];

    const communities =
      communityIds.length > 0
        ? await this.prisma.community.findMany({
            where: { id: { in: communityIds }, schoolId },
            select: {
              id: true,
              name: true,
              title: true,
            },
          })
        : [];

    const communitiesById = new Map(communities.map((community) => [community.id, community]));

    const breakdown = [...byCommunity.entries()].map(([communityId, karma]) => {
      const community = communitiesById.get(communityId);

      return {
        communityId,
        communityName: community?.name ?? 'unknown',
        communityTitle: community?.title ?? communityId,
        postKarma: karma.postKarma,
        commentKarma: karma.commentKarma,
        total: karma.postKarma + karma.commentKarma,
      };
    });

    breakdown.sort((a, b) => b.total - a.total);

    const totals = breakdown.reduce(
      (acc, item) => ({
        postKarma: acc.postKarma + item.postKarma,
        commentKarma: acc.commentKarma + item.commentKarma,
      }),
      { postKarma: 0, commentKarma: 0 },
    );

    return {
      totals: {
        ...totals,
        total: totals.postKarma + totals.commentKarma,
      },
      byCommunity: breakdown,
    };
  }

  // =====================================================
  // CREATED POSTS
  // =====================================================

  async getCreatedPosts(targetUserId: string, schoolId: string) {
    await this.assertUserExists(targetUserId, schoolId);

    return this.prisma.post.findMany({
      where: { authorId: targetUserId, schoolId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        score: true,
        createdAt: true,
        _count: { select: { comments: true } },
        community: { select: { name: true, title: true } },
      },
    });
  }

  // =====================================================
  // CREATED COMMENTS
  // =====================================================

  async getCreatedComments(targetUserId: string, schoolId: string) {
    await this.assertUserExists(targetUserId, schoolId);

    return this.prisma.comment.findMany({
      where: { authorId: targetUserId, schoolId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        score: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            community: { select: { name: true, title: true } },
          },
        },
      },
    });
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private async assertUserExists(
    targetUserId: string,
    schoolId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: targetUserId, schoolId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async getKarmaTotals(userId: string, schoolId: string) {
    const [postAgg, commentAgg] = await Promise.all([
      this.prisma.post.aggregate({
        where: { authorId: userId, schoolId },
        _sum: { score: true },
      }),
      this.prisma.comment.aggregate({
        where: { authorId: userId, schoolId },
        _sum: { score: true },
      }),
    ]);

    const postKarma = postAgg._sum.score ?? 0;
    const commentKarma = commentAgg._sum.score ?? 0;

    return {
      totals: {
        postKarma,
        commentKarma,
        total: postKarma + commentKarma,
      },
    };
  }
}
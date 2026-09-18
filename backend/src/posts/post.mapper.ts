import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';

export interface MappedPost {
  id: string;
  title: string;
  content: string;
  score: number;
  createdAt: Date;
  commentCount: number;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  community: {
    id: string;
    name: string;
    title: string;
  };
}

@Injectable()
export class PostMapper {
  buildSelect(_userId: string) {
    return {
      select: {
        id: true,
        title: true,
        content: true,
        score: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true, title: true } },
        _count: { select: { comments: true } },
      },
    } satisfies { select: Prisma.PostSelect };
  }

  map(
    posts: Array<{
      id: string;
      title: string;
      content: string;
      score: number;
      createdAt: Date;
      author: { id: string; name: string; avatar: string | null };
      community: { id: string; name: string; title: string };
      _count: { comments: number };
    }>,
  ): MappedPost[] {
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      score: post.score,
      createdAt: post.createdAt,
      commentCount: post._count.comments,
      author: post.author,
      community: post.community,
    }));
  }
}
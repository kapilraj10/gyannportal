import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // =====================================================
  // POST /comments
  // =====================================================

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(user, dto);
  }

  // =====================================================
  // GET /comments/post/:postId
  // =====================================================

  @Get('post/:postId')
  listByPost(
    @CurrentUser() user: AuthUser,
    @Param('postId') postId: string,
  ) {
    return this.commentsService.listByPost(user, postId);
  }
}
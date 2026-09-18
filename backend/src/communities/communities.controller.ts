import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { CommunitiesService } from './communities.service.js';
import { CreateCommunityDto } from './dto/create-community.dto.js';
import {
  CommunityPostsQueryDto,
  ListCommunitiesQueryDto,
} from './dto/community-queries.dto.js';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  // =====================================================
  // POST /communities
  // =====================================================

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(user, dto);
  }

  // =====================================================
  // GET /communities?filter=all|joined
  // =====================================================

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListCommunitiesQueryDto,
  ) {
    return this.communitiesService.list(user, query);
  }

  // =====================================================
  // GET /communities/:name
  // =====================================================

  @Get(':name')
  getByName(
    @CurrentUser() user: AuthUser,
    @Param('name') name: string,
  ) {
    return this.communitiesService.getByName(user, name);
  }

  // =====================================================
  // GET /communities/:name/posts?sort=new|hot
  // =====================================================

  @Get(':name/posts')
  getPosts(
    @CurrentUser() user: AuthUser,
    @Param('name') name: string,
    @Query() query: CommunityPostsQueryDto,
  ) {
    return this.communitiesService.getPosts(user, name, query);
  }

  // =====================================================
  // POST /communities/:name/join
  // =====================================================

  @Post(':name/join')
  join(
    @CurrentUser() user: AuthUser,
    @Param('name') name: string,
  ) {
    return this.communitiesService.join(user, name);
  }

  // =====================================================
  // DELETE /communities/:name/join
  // =====================================================

  @Delete(':name/join')
  leave(
    @CurrentUser() user: AuthUser,
    @Param('name') name: string,
  ) {
    return this.communitiesService.leave(user, name);
  }
}
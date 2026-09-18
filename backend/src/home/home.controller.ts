import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { HomeService } from './home.service.js';
import { HomeFeedQueryDto } from './dto/home-feed-query.dto.js';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // =====================================================
  // GET /feed?sort=new|hot
  // =====================================================

  @Get()
  feed(@CurrentUser() user: AuthUser, @Query() query: HomeFeedQueryDto) {
    return this.homeService.getFeed(user, query);
  }
}
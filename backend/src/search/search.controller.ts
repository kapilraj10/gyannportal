import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import type { AuthUser } from '../common/types/auth-user.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { SearchService } from './search.service.js';
import { SearchQueryDto } from './dto/search-query.dto.js';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // =====================================================
  // GET /search?q=&type=&communityId=
  // =====================================================

  @Get()
  search(@CurrentUser() user: AuthUser, @Query() query: SearchQueryDto) {
    return this.searchService.search(user, query);
  }
}
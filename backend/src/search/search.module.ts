import { Module } from '@nestjs/common';

import { PostMapper } from '../posts/post.mapper.js';

import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  controllers: [SearchController],
  providers: [SearchService, PostMapper],
})
export class SearchModule {}
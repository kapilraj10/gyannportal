import { Module } from '@nestjs/common';

import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { PostMapper } from './post.mapper.js';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostMapper],
  exports: [PostMapper],
})
export class PostsModule {}
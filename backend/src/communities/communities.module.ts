import { Module } from '@nestjs/common';

import { PostMapper } from '../posts/post.mapper.js';

import { CommunitiesController } from './communities.controller.js';
import { CommunitiesService } from './communities.service.js';

@Module({
  controllers: [CommunitiesController],
  providers: [CommunitiesService, PostMapper],
})
export class CommunitiesModule {}
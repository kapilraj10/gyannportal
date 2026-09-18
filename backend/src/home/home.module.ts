import { Module } from '@nestjs/common';

import { PostMapper } from '../posts/post.mapper.js';

import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';

@Module({
  controllers: [HomeController],
  providers: [HomeService, PostMapper],
})
export class HomeModule {}
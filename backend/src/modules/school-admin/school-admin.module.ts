import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module.js';
import { SchoolAdminController } from './school-admin.controller.js';
import { SchoolAdminService } from './school-admin.service.js';

@Module({
  imports: [UsersModule],
  controllers: [SchoolAdminController],
  providers: [SchoolAdminService],
  exports: [SchoolAdminService],
})
export class SchoolAdminModule {}
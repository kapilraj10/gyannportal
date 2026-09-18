import { Module } from '@nestjs/common';

import { SuperAdminController } from './super-admin.controller.js';
import { SuperAdminService } from './super-admin.service.js';

import { SchoolsModule } from '../schools/schools.module.js';
import { UsersModule } from '../../users/users.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';

@Module({
  imports: [SchoolsModule, UsersModule, AuditLogsModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service.js';
import { DatabaseService } from './database/database.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    try {
      await this.databaseService.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        api: 'up',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        api: 'up',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

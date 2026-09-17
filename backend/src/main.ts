import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ==========================================
  // VALIDATION
  // ==========================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ==========================================
  // CORS
  // ==========================================

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  // ==========================================
  // API PREFIX
  // ==========================================

  app.setGlobalPrefix('api/v1');

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);
  logger.log(`GyannPortal API running on http://localhost:${port}/api/v1`);
}
await bootstrap();
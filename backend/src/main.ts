import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import express from 'express';

import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { UPLOAD_DIR } from './common/storage/multer.config.js';

// ==========================================
// CORS ORIGINS
// ==========================================

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

function getCorsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_CORS_ORIGINS;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
  );

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
  // GLOBAL ERRORS + RESPONSE ENVELOPE
  // ==========================================

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ==========================================
  // CORS
  // ==========================================

  const allowedOrigins = getCorsOrigins();

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // Non-browser requests (curl, server-to-server) send no origin.
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      callback(
        new Error(`Origin '${requestOrigin}' is not allowed by CORS`),
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 3600,
  });

  logger.log(
    `CORS enabled for origins: ${allowedOrigins.join(', ')} or no-origin requests`,
  );

  // ==========================================
  // STATIC UPLOADS
  // ==========================================

  app.use('/uploads', express.static(UPLOAD_DIR));

  // ==========================================
  // API PREFIX
  // ==========================================

  app.setGlobalPrefix('api/v1');

  // ==========================================
  // SWAGGER
  // ==========================================

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GyannPortal API')
    .setDescription(
      'Multi-tenant school management platform — REST API with JWT auth, RBAC, permissions and school-level tenant isolation.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your access token (JWT) obtained from POST /auth/login',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication, registration, token refresh')
    .addTag('Super Admin', 'Platform-wide management (SUPER_ADMIN only)')
    .addTag('School Admin', 'School-scoped dashboard and profile')
    .addTag('Schools', 'School management')
    .addTag('Branches', 'School branch management')
    .addTag('Academic Years', 'Academic year management')
    .addTag('Roles', 'Role management (RBAC)')
    .addTag('Permissions', 'Permission catalog')
    .addTag('Students', 'Student management')
    .addTag('Teachers', 'Teacher management')
    .addTag('Parents', 'Parent management')
    .addTag('Classes', 'Class management')
    .addTag('Sections', 'Section management')
    .addTag('Subjects', 'Subject management')
    .addTag('Courses', 'Course management')
    .addTag('Enrollments', 'Enrollment management')
    .addTag('Attendance', 'Attendance marking and reports')
    .addTag('Assignments', 'Assignment creation, submission and grading')
    .addTag('Exams', 'Exam management')
    .addTag('Results', 'Result recording and reports')
    .addTag('Notifications', 'User notifications')
    .addTag('Files', 'File uploads and metadata')
    .addTag('Audit Logs', 'Audit trail')
    .addTag('Admin - Users', 'User administration')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  logger.log('Swagger UI available at http://localhost:8000/api/docs');

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);
  logger.log(`GyannPortal API running on http://localhost:${port}/api/v1`);
}
void bootstrap();
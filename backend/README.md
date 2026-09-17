# GyannPortal — Backend API

REST API for the GyannPortal School Management System.

**Stack:** NestJS 12 · TypeScript · Prisma 7 · PostgreSQL (`@prisma/adapter-pg`)
**Runtime style:** ESM (`"type": "module"`) — relative imports use `.js` suffix.
**Default port:** 8000 · **Base path:** `/api/v1`

## Setup

```bash
npm install
cp .env.example .env    # configure DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
npx prisma migrate dev  # create schema (first run)
npm run start:dev
```

## Scripts

```bash
npm run build      # compile with nest build (tsc)
npm run start:dev  # watch mode
npm run start:prod # run compiled output
npm run lint       # oxlint --type-aware
npm test           # vitest
```

## Configuration (.env)

| Variable          | Example                                        | Purpose                |
| ----------------- | ---------------------------------------------- | ---------------------- |
| `PORT`            | `8000`                                         | HTTP port              |
| `DATABASE_URL`    | `postgresql://user:pass@localhost:5432/gyannportal_db` | PostgreSQL DSN |
| `JWT_SECRET`      | long random string                              | JWT signing secret     |
| `JWT_EXPIRES_IN`  | `7d`                                            | Token lifetime         |

## API Reference

### Health check

`GET /api/v1/health` — returns API + database status.

### Register a school

`POST /api/v1/auth/register-school`

Creates a School, an optional Branch, and the School Admin user in one transaction, then returns a JWT.

```json
{
  "schoolName": "Kathmandu Academy",
  "schoolCode": "KATH-ACAD",
  "registrationNumber": "1234567",
  "schoolType": "PRIVATE",
  "level": "SECONDARY",
  "establishedYear": 1995,
  "schoolEmail": "info@kathmanduacademy.edu.np",
  "phone": "+977-1-4000000",
  "website": "https://kathmanduacademy.edu.np",
  "address": "Baneshwor, Kathmandu",

  "adminName": "Ramesh Sharma",
  "adminEmail": "ramesh.admin@gmail.com",
  "adminPhone": "+977-98...",
  "adminPassword": "StrongPass123",

  "branchName": "Main Campus",
  "branchAddress": "Baneshwor, Kathmandu"
}
```

**Responses:**
- `201` — `{ message, accessToken, user: { id, name, email, role, schoolId, school, branch } }`
- `400` — validation errors (whitelist + DTO rules)
- `409` — school code or admin email already exists

### Login

`POST /api/v1/auth/login`

```json
{ "email": "ramesh.admin@gmail.com", "password": "StrongPass123" }
```

Checks password, `UserStatus.ACTIVE`, and `SchoolStatus.ACTIVE`. Returns the same shape as register.

`401` for invalid credentials or inactive account/school.

### Current user

`GET /api/v1/auth/me`

Requires `Authorization: Bearer <token>`. Returns the authenticated user with role, school, and branch.

## Architecture

```
src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── database/        # DatabaseModule (global) + DatabaseService (PrismaClient + PrismaPg)
├── generated/prisma # Prisma 7 generated client (committed)
├── auth/            # controller, service, module, dto/, guards/, strategies/
└── common/          # @CurrentUser() decorator
```

## Validation Rules

- `ValidationPipe` global: `whitelist`, `forbidNonWhitelisted`, `transform`.
- `schoolCode` must match `^[A-Za-z0-9_-]+$`, normalized to uppercase.
- Emails normalized to lowercase; names/fields trimmed.
- Passwords: min 8 chars, hashed with bcrypt (cost 12).

## Key Implementation Notes

- **ESM:** every relative import ends in `.js`.
- **Prisma 7:** import client from `src/generated/prisma/client.js`; enums double as values and types; `Role` is a model type.
- **@nestjs/passport v12** requires `PassportModule.register({ defaultStrategy: 'jwt' })`.
- `DatabaseService` extends `PrismaClient` with a `PrismaPg({ connectionString })` adapter.
- Only `DatabaseModule` is `@Global()`; `AuthModule` is a normal module imported by `AppModule`.
# GyannPortal — Backend API

REST API for the GyannPortal School Management System — multi-tenant, role-based, with auth + refresh tokens.

**Stack:** NestJS 12 · TypeScript · Prisma 7 · PostgreSQL (`@prisma/adapter-pg`)
**Runtime style:** ESM (`"type": "module"`) — relative imports use `.js` suffix.
**Default port:** 8020 · **Base path:** `/api/v1` · **Swagger UI:** `/api/docs`

## Setup

```bash
npm install
cp .env.example .env    # configure DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npx prisma migrate dev  # create schema (first run)
npx prisma db seed      # RBAC + permissions + super admin + demo school (tsx prisma/seed.ts)
npm run start:dev
```

The Postgres database must be reachable at startup (`DatabaseService` connects on init).

## Scripts

```bash
npm run build      # compile with nest build (tsc)
npm run start:dev  # watch mode
npm run start:prod # run compiled output
npm run lint       # oxlint --type-aware src/ test/
npm test           # vitest (unit)
npm run test:e2e   # vitest --config ./vitest.config.e2e.ts
```

## Configuration (.env)

| Variable                 | Example                                        | Purpose                                        |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| `PORT`                   | `8020`                                         | HTTP port                                      |
| `DATABASE_URL`           | `postgresql://user:pass@localhost:5432/gyannportal_db?schema=public` | PostgreSQL DSN |
| `JWT_SECRET`             | long random string                              | Access-token signing secret                    |
| `JWT_EXPIRES_IN`         | `1d`                                            | Access-token lifetime                          |
| `JWT_REFRESH_SECRET`     | another long random string                      | Refresh-token signing secret                   |
| `JWT_REFRESH_EXPIRES_IN` | `30d`                                           | Refresh-token lifetime                         |
| `CORS_ORIGINS`           | `http://localhost:3000,...`                     | Comma-separated allowed origins (defaults to dev origins) |
| `UPLOAD_DIR`             | *(optional)*                                    | File-upload directory (default `<cwd>/uploads`) |
| `SEED_ADMIN_PASSWORD`    | `SuperAdmin@123`                                | Super-admin password created by `npx prisma db seed` |

## API Reference

All protected routes accept `Authorization: Bearer <accessToken>`.

### Health

`GET /api/v1/health` — API + database status.

### Auth

`POST /api/v1/auth/register-school`

Creates a School, an optional Branch, and the School Admin user in one transaction, then returns a token pair.

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

**Responses:** `201` — `{ message, accessToken, refreshToken, user }` · `400` validation · `409` duplicate school code / admin email.

`POST /api/v1/auth/login`

```json
{ "email": "ramesh.admin@gmail.com", "password": "StrongPass123" }
```

Validates password, `UserStatus.ACTIVE`, `SchoolStatus.ACTIVE`. Returns `{ accessToken, refreshToken, user }` (user includes `permissions`). `401` on failure.

`POST /api/v1/auth/refresh` — body `{ "refreshToken": "..." }`. Rotates the token: revokes the used refresh token (stored hashed) and issues a new pair.

`POST /api/v1/auth/logout` — body `{ "refreshToken": "..." }` *(optional)*. Revokes the given token, or all active tokens when omitted.

`GET /api/v1/auth/me` — current user with role, school, branch, and permissions.

`POST /api/v1/auth/change-password` — verifies current password, hashes the new one, revokes all refresh tokens.

### Platform modules (JWT + RBAC)

| Module            | Endpoints (under `/api/v1`)                                  | Access                                  |
| ----------------- | ------------------------------------------------------------ | --------------------------------------- |
| Super Admin       | `/super-admin/dashboard`, `/super-admin/schools[/:id]`, `/super-admin/users[/:id/status]`, `/super-admin/audit-logs` | `SUPER_ADMIN` |
| School Admin      | `/school-admin/dashboard`, `/school-admin/profile`           | `SCHOOL_ADMIN`+                         |
| Schools           | CRUD `/schools[/:id]`                                        | create/update/delete: `SUPER_ADMIN`     |
| Branches          | CRUD `/branches[/:id]`                                       | school-scoped                           |
| Academic Years    | CRUD `/academic-years[/:id]`                                 | school-scoped                           |
| Roles             | `GET /roles`, `GET /roles/:id`, CRUD `/roles` (admin)        | RBAC                                    |
| Permissions       | `GET /permissions`, `GET /permissions/grouped`               | all authenticated                       |
| Users             | `GET/PATCH /users/me`, `GET /users/:id`, CRUD `/admin/users` | self / `SUPER_ADMIN`                    |
| Students          | CRUD `/students[/:id]` + portal `/students/me/{dashboard,classes,attendance,assignments,exams,results,notifications}` | admin / `STUDENT` |
| Teachers          | CRUD `/teachers[/:id]` + portal `/teachers/me/*`             | admin / `TEACHER`                       |
| Parents           | CRUD `/parents[/:id]` + portal `/parents/me/children[/:studentId]/*` | admin / `PARENT`                 |
| Classes           | CRUD `/classes[/:id]`                                        | school-scoped                           |
| Sections          | CRUD `/sections[/:id]`                                       | school-scoped                           |
| Subjects          | CRUD `/subjects[/:id]`                                       | school-scoped                           |
| Courses           | CRUD `/courses[/:id]` (teachers see own)                     | school-scoped                           |
| Enrollments       | CRUD `/enrollments[/:id]` + `POST /enrollments/bulk`         | school-scoped                           |
| Attendance        | `POST /attendance`, `GET /attendance`, `/attendance/summary`, `GET/DELETE /attendance/:id` | `ATTENDANCE_*` |
| Assignments       | CRUD `/assignments[/:id]`, `/assignments/:id/submit`, `/assignments/:id/submissions`, `PATCH /assignments/submissions/:id/grade` | `ASSIGNMENT_*` |
| Exams             | CRUD `/exams[/:id]`                                          | `EXAM_*`                                |
| Results           | CRUD `/results[/:id]` + `POST /results/bulk`                 | `RESULT_*`                              |
| Notifications     | `POST /notifications`, `GET /notifications`, `GET/PATCH /notifications/:id(/read)`, `PATCH /notifications/read-all` | `NOTIFICATION_*` |
| Audit Logs        | `GET /audit-logs` (school-scoped; `SUPER_ADMIN` sees all)    | `AUDIT_LOG_READ`                        |
| Files             | `POST /files/upload` (multipart), `GET /files`, `GET/DELETE /files/:id` | authenticated (10 MB, MIME-blocklist) |

### Social / community

| Module      | Endpoints (under `/api/v1`)                                                          |
| ----------- | ------------------------------------------------------------------------------------ |
| Communities | `POST /communities`, `GET /communities`, `GET /communities/:name`, `/communities/:name/posts`, `POST/DELETE /communities/:name/join` |
| Posts       | `POST /posts`, `GET /posts/:id`                                                       |
| Comments    | `POST /comments`, `GET /comments/post/:postId` (threaded)                             |
| Votes       | `POST /votes` (toggle), `DELETE /votes` (polymorphic post/comment)                    |
| Search      | `GET /search?q=&type=posts\|comments\|communities\|people&communityId=`               |
| Home / Feed | `GET /feed?sort=new\|hot`                                                             |

Responses are wrapped uniformly: success `{ success: true, message, data, meta? }`, errors `{ success: false, message, statusCode, errors? }`.

## Seed Data

`npx prisma db seed` (`prisma/seed.ts`) upserts 41 permissions and 5 roles, creates the super admin, then builds demo content in school `GYAN001`:

- Branch, academic years, teachers, parents, 5 students, classes/sections, subjects, courses, enrollments.
- Demo accounts: teachers, parents, students → password `Demo@123`; super admin → `SEED_ADMIN_PASSWORD`.

## Architecture

```
src/
├── main.ts                      # prefix, ValidationPipe, CORS, filters/interceptors, Swagger, /uploads
├── app.module.ts                # root module (30+ feature modules)
├── app.controller.ts            # GET / and GET /health
├── database/                    # DatabaseModule (global) + DatabaseService (PrismaClient + PrismaPg)
├── generated/prisma             # Prisma 7 generated client (committed)
├── common/                      # guards (jwt/roles/permissions), decorators, filters, interceptors,
│                                # pagination, multer config, access.helper, auth-user type, enums
├── auth/                        # register-school, login, refresh, logout, me, change-password,
│                                # jwt + refresh strategies, guards
├── users/                       # self profile + admin user CRUD
├── communities/ posts/ comments/ votes/ search/ home/   # social layer
└── modules/                     # platform modules (one folder per domain, see table above)
```

## Validation & Conventions

- Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`.
- `schoolCode` must match `^[A-Za-z0-9_-]+$`, normalized to uppercase; emails lowercased; strings trimmed.
- Passwords: min 8 chars, hashed with bcrypt (cost 12).
- **ESM:** every relative import ends in `.js`.
- **Prisma 7:** import the client from `src/generated/prisma/client.js`; enums double as values and types.
- **@nestjs/passport v12** requires `PassportModule.register({ defaultStrategy: 'jwt' })`.
- Multi-step writes (role + school + branch + user) run inside `prisma.$transaction`.

## Security

- Access JWT (`1d`) + rotating refresh JWT (`30d`, stored SHA-256 hashed, single-use).
- RBAC via `RolesGuard` + `PermissionsGuard`; `SUPER_ADMIN` bypasses role checks.
- School-level tenant isolation enforced in services via `common/helpers/access.helper.ts`.
- Uploads restricted to 10 MB with MIME/extension blocklist; served statically at `/uploads`.
- Audit logging for auth, school, user, and platform actions (best-effort, never breaks the request).
# GyannPortal — System Architecture

## 1. High-Level Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend (web) │     │   Backend API    │     │    Database     │
│  Next.js 16     │────▶│   NestJS 12      │────▶│  PostgreSQL     │
│  Tailwind v4    │ JWT │   Prisma 7       │     │  (adapter-pg)   │
│  axios + refresh│     │   RBAC + audit   │     └─────────────────┘
└─────────────────┘     └──────────────────┘
┌─────────────────┐            ▲
│  Mobile App     │────────────│─ HTTPS + JWT
│  Flutter        │   (planned)
└─────────────────┘
```

## 2. Repository Layout

```
gyannportal/
├── frontend/            # Landing page + role-based dashboards (web)
├── backend/             # REST API (monolithic NestJS, 30+ feature modules)
└── gyannportal_mobile/  # Flutter multi-platform app (scaffold)
```

## 3. Backend Architecture

```
src/
├── main.ts                      # Bootstrap: ValidationPipe, CORS, filters/interceptors,
│                                # Swagger UI (/api/docs), static /uploads, /api/v1 prefix
├── app.module.ts                # Root module: Config, Database, all platform + social modules
├── app.controller.ts            # GET / and GET /health
├── database/
│   ├── database.module.ts       # @Global() module
│   └── database.service.ts      # Extends PrismaClient (PrismaPg adapter)
├── generated/prisma/            # Generated Prisma 7 client (commit to repo)
├── auth/                        # register-school, login, refresh, logout, me, change-password;
│                                # jwt + refresh strategies, RefreshTokenGuard
├── common/
│   ├── guards/                  # JwtAuthGuard, RolesGuard, PermissionsGuard (TenantGuard: unused)
│   ├── decorators/              # @CurrentUser(), @Public(), @Roles(), @Permissions()
│   ├── filters/all-exceptions.filter.ts       # { success:false, ... } error envelope
│   ├── interceptors/transform.interceptor.ts  # { success:true, data, meta } success envelope
│   ├── pagination/              # PaginationQueryDto, paginate(), buildPaginationMeta()
│   ├── storage/multer.config.ts # 10 MB disk uploads, MIME/extension blocklist
│   ├── helpers/access.helper.ts # resolveSchoolId, assertSameSchool, assertStudentAccess, ...
│   ├── types/auth-user.ts       # AuthUser shape on @CurrentUser()
│   └── enums/                   # role, permission, audit-action enums
├── users/                       # profile + admin user administration
├── communities/ posts/ comments/ votes/ search/ home/   # social layer
└── modules/                     # one folder per platform domain:
    ├── super-admin/  school-admin/  schools/  branches/  roles/  permissions/
    ├── academic-years/  students/  teachers/  parents/
    ├── classes/  sections/  subjects/  courses/  enrollments/
    ├── attendance/  assignments/  exams/  results/
    ├── notifications/  files/  audit-logs/
```

## 4. Data Model (Prisma) — 31 models + 26 enums

**Tenancy & identity**

- **School** — `1 : N` AcademicYear, Branch, User
- **AcademicYear** — belongs to School, unique per `schoolId + name`
- **Branch** — belongs to School, unique per `schoolId + name`
- **User** — belongs to School (required) and Branch (optional); has one Role; `1:1` Student/Teacher/Parent profile
- **Role** — `M : N` Permission via RolePermission join table
- **Permission** — flat catalog of 41 permissions in 12 groups
- **RefreshToken** — SHA-256 hashed, rotated per use

**Academic domain**

- **Student / Teacher / Parent / ParentStudent** — profiles with status, gender, contacts
- **Class / Section / Subject / Course / TeacherClass** — academic structure; Class → Sections, Course links Subject
- **Enrollment** — Student ↔ Class per academic year (ACTIVE/COMPLETED/DROPPED/WITHDRAWN)
- **Attendance** — per student/class/date (PRESENT/ABSENT/LATE/EXCUSED) with remarks
- **Assignment / AssignmentSubmission** — create/publish/close; submit/grade workflow
- **Exam / Result** — exam status workflow; per-student marks + grading

**Operations & platform**

- **Notification** — per-user, INFO/WARNING/SUCCESS/ERROR/ANNOUNCEMENT, read-flag
- **MediaFile** — upload metadata (category, storage provider LOCAL/S3/CLOUDINARY)
- **AuditLog** — action, entity, actor, IP, school-scoped

**Social**

- **Community / CommunityMember** — public/private, OWNER/MODERATOR/MEMBER
- **Post / Comment / Vote** — threaded comments, polymorphic votes (POST/COMMENT)

### Enums

`SchoolType`, `SchoolLevel`, `SchoolStatus`, `AcademicYearStatus`, `BranchStatus`, `UserStatus`, `Gender`, `CommunityType`, `CommunityMemberRole`, `VoteTarget`, `StudentStatus`, `TeacherStatus`, `ParentStatus`, `ClassStatus`, `SectionStatus`, `SubjectStatus`, `CourseStatus`, `EnrollmentStatus`, `AttendanceStatus`, `AssignmentStatus`, `AssignmentSubmissionStatus`, `ExamStatus`, `NotificationType`, `FileCategory`, `StorageProvider`, `ParentChildRelationship`

Prisma generator: `prisma-client` (ESM) writing to `src/generated/prisma`.

## 5. Authentication & Authorization Flow

1. **Register** → create `Role (SCHOOL_ADMIN)`, `School`, optional `Branch`, `User` in a **transaction** → return access + refresh token pair.
2. **Login** → verify email/password → check `UserStatus.ACTIVE` and `SchoolStatus.ACTIVE` → return token pair + profile (incl. permissions).
3. **Protected routes** → `JwtAuthGuard` extracts bearer token via `JwtStrategy` → payload exposes `{ userId, email, schoolId, roleId, role }` to `@CurrentUser()`.
4. **Refresh** → `RefreshTokenGuard` validates the body `refreshToken` with `JWT_REFRESH_SECRET`; old token revoked, new pair issued. Refresh tokens are stored SHA-256 hashed and single-use.
5. **RBAC** → `RolesGuard` (exact role match, `SUPER_ADMIN` bypass, uses `@Roles()`) and `PermissionsGuard` (at-least-one-of via `@Permissions()`, `SUPER_ADMIN` bypass).
6. **Tenant isolation** → enforced in services via `access.helper.ts` (`resolveSchoolId`, `assertSameSchool`, etc.); every platform query is school-scoped.

### JWT Payload

Access: `{ sub, email, schoolId, roleId, role }` · Refresh: `{ sub, type: 'refresh', jti }`

## 6. Environment Configuration

`.env` / `.env.example`:

```
PORT=8020
DATABASE_URL="postgresql://user:password@localhost:5432/gyannportal_db?schema=public"
JWT_SECRET="<long-random-secret>"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="<another-long-random-secret>"
JWT_REFRESH_EXPIRES_IN="30d"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173"
SEED_ADMIN_PASSWORD="SuperAdmin@123"
```

## 7. Naming & Conventions

- **ESM:** `"type": "module"` in `package.json`; all relative imports use `.js` suffix.
- **Prisma:** generated client imported from `../generated/prisma/client.js`; enums are both values and types.
- **Password hashing:** bcrypt, cost 12.
- **Errors:** semantic Nest exceptions wrapped by the global `AllExceptionsFilter`.
- **Validation:** DTOs decorated with `class-validator`; global whitelist + forbidNonWhitelisted + transform.
- **API contract:** success responses `{ success, message, data, meta? }`; errors `{ success, message, statusCode, errors? }`.

## 8. Security

- Access JWT (`1d`) + rotating refresh JWT (`30d`, hashed in DB, single-use).
- RBAC: 5 roles, 41 permissions, `RolesGuard` + `PermissionsGuard`; `SUPER_ADMIN` bypass.
- School-level tenant isolation in service layer (no cross-school reads).
- bcrypt password hashing (cost 12).
- `ValidationPipe` with whitelist (prevents mass assignment).
- CORS allow-list; uploads restricted to 10 MB with MIME/extension blocklist.
- Audit logging for auth, school, user, and platform actions.
- Database access via singleton `DatabaseService` (PrismaPg adapter).

## 9. Future Considerations

- Add module-per-domain folders for remaining Phase 5 areas (fees, timetable, library, transport, hostel).
- Global `APP_GUARD` composition + activate `TenantGuard` for defense-in-depth.
- Paged list endpoints with query DTOs (mostly present now); add filters/export.
- Event-driven notifications (announcements, push) + rate limiting.
- Horizontal scaling via stateless JWT + refresh-token rotation.
- Flutter mobile app wired to `/api/v1` (currently scaffold only).
# GyannPortal — Memory / Progress Log

## Latest Status (2026-09-19)

### Frontend — Landing Page + Role-Based Dashboards ✅
Implemented in `frontend/` (Next.js 16 App Router, TypeScript strict, Tailwind CSS v4):

- **Landing page** (`app/page.tsx`, `components/*`): Navbar, Hero, Stats, ProblemSolution, Features, Roles, DashboardShowcase, MobileApp, Security, Pricing, Testimonials, FAQ, CTA, Footer + `AuthModal`. Sticky glass navbar, IntersectionObserver reveals, animated counters, SEO metadata. Brand colors Primary `#2563EB`, Accent `#14B8A6`, Secondary `#0F766E`.
- **Auth**: login + register-school pages; axios client (`lib/api/client.ts`) attaches bearer token, performs single-flight **refresh on 401** and replays the request, then clears session on failure. Tokens in `sessionStorage` (access also mirrored in memory); NOT in `localStorage`.
- **Dashboards** for all 5 roles behind `DashboardShell` (permission-filtered sidebar, glass header, notification bell):
  - `/dashboard/super-admin` — overview, schools CRUD, users (activate/suspend), audit logs, notifications, settings
  - `/dashboard/school-admin` — overview + **13 CRUD pages** (students, teachers, parents, classes, sections, subjects, courses, academic-years, enrollments, branches, exams, assignments, results), attendance marking, audit logs, notifications, settings
  - `/dashboard/teacher` — overview, classes, students, attendance, assignments, marks, exams, notifications, settings
  - `/dashboard/student` — overview, classes, attendance, assignments (submit answer), exams, marks, notifications, settings
  - `/dashboard/parent` — overview, children list + per-child detail, attendance/assignments/exams/results (with child selector), notifications, settings
- Generic CRUD engine (`components/crud/CrudPage.tsx`) + DataTable/Pagination/Modal/ConfirmDialog, typed API client factory (`lib/api/factory.ts`), `use-select-options`, pagination & parent-children hooks.
- ✅ `npm run build` passes, ✅ `eslint` clean (verified 2026-09-19).

### Backend — Full REST API ✅
NestJS 12 API implemented in `backend/` (ESM, Prisma 7, PostgreSQL):

- **Prisma schema**: 31 models + 26 enums — School, AcademicYear, Branch, User, Role, Permission, RolePermission, RefreshToken, Student, Teacher, Parent, ParentStudent, Class, Section, Subject, Course, TeacherClass, Enrollment, Attendance, Assignment, AssignmentSubmission, Exam, Result, Notification, MediaFile, AuditLog, Community, CommunityMember, Post, Comment, Vote.
- **Auth** (`/auth`): register-school, login, `refresh` (rotating refresh token stored **SHA-256 hashed**, single-use), logout, me, change-password — access JWT (`1d`) + refresh JWT (`30d`).
- **RBAC**: 5 roles (SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, PARENT, STUDENT), 41 permissions in 12 groups; `RolesGuard`, `PermissionsGuard`, `@Roles()` / `@Permissions()` / `@Public()` / `@CurrentUser()` decorators; SUPER_ADMIN bypasses. Tenant isolation via `access.helper.ts` (resolveSchoolId, assertSameSchool, etc.).
- **Platform modules**: schools, branches, academic-years, roles, permissions, students, teachers, parents, classes, sections, subjects, courses, enrollments (incl. bulk), attendance (mark+summary), assignments (submit/grade), exams, results (incl. bulk), notifications, audit-logs, files (multipart upload → `uploads/`), `super-admin` and `school-admin` dashboard endpoints, plus role-scoped **portal routes** (`/students/me/*`, `/teachers/me/*`, `/parents/me/*`).
- **Social module**: communities (join/leave), posts, comments (threaded), votes (toggle), search, home feed (new/hot).
- **Shared infra**: `AllExceptionsFilter` (`{success:false,...}`), `TransformInterceptor` (`{success:true,data,meta}`), pagination helpers, audit logging (best-effort), global `ValidationPipe` (whitelist + forbidNonWhitelisted + transform), CORS allow-list, static `/uploads`, **Swagger UI at `/api/docs`**.
- **Seed** (`prisma/seed.ts`): upserts all permissions/roles + super admin; creates demo school GYAN001 with branches, academic years, teachers, parents, students (5), classes/sections, subjects, courses, enrollments. Demo passwords: `Demo@123`; super admin from `SEED_ADMIN_PASSWORD` (default `SuperAdmin@123`).
- ✅ `npm run build` passes; `oxlint` passes with a few unused-variable/import warnings.

### Mobile — Flutter
`gyannportal_mobile/` is still the **default Flutter counter-app scaffold** — no GyannPortal screens or API wiring yet.

## Known Environment Notes

- Backend port is now **8020** (from `backend/.env`); base path `/api/v1`; Swagger at `/api/docs`.
- `POST /api/docs` Swagger log message in `main.ts` still prints port 8000 (cosmetic; actual port from `PORT` env).
- Database must be running for the API to boot (DatabaseService connects on init).
- `TenantGuard` (`src/common/guards/tenant.guard.ts`) is defined but not registered — tenant isolation is done in services.

## Next Steps

1. Phase 5 Operations: Fees & Payments, Timetable, Library, Transport, Hostel.
2. Phase 6: actually build the Flutter app (login, role dashboards, API wiring).
3. Phase 7: analytics dashboards + exportable reports (PDF/Excel), certificate generation.
4. Backend integration tests (currently only unit + minimal e2e).
5. Production deployment (env hints already point to `https://api.gyannportal.sampannatech.online/api/v1`).

## Decisions

- ESM everywhere on backend → imports need `.js` suffix.
- @nestjs/passport v12 requires `PassportModule.register({ defaultStrategy: 'jwt' })`.
- Prisma 7 `prisma-client` generator committed to `src/generated/prisma`.
- Access+refresh token pair issued in response body (not httpOnly cookies) → client stores in sessionStorage, not localStorage.
- Landing page stays light-theme only (no dark mode) — enterprise schooling context.
- `ProtectedPage` exists in frontend but dashboard pages use `DashboardShell`'s own role guard.
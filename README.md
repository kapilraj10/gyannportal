# GyannPortal — School Management System

**স্মার্ট বিদ্যালয়, সৰল ব্যৱস্থাপন।** One platform to manage your entire school.

GyannPortal is a modern, end-to-end **School Management System** that connects administrators, teachers, students, and parents in one secure and intelligent platform.

## Monorepo Structure

| Directory             | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `frontend/`           | Next.js 16 landing page + role-based web dashboard (TypeScript, Tailwind v4) |
| `backend/`            | NestJS 12 REST API with Prisma 7 + PostgreSQL, auth, RBAC, uploads, Swagger   |
| `gyannportal_mobile/` | Flutter mobile app for Android / iOS / web / desktop (scaffold)               |

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4, `lucide-react` icons
- **HTTP:** axios client with automatic JWT refresh (single-flight 401 handling)
- **Fonts:** Geist (via `next/font`)

### Backend
- **Framework:** NestJS 12 (ESM, `"type": "module"`)
- **Database:** PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- **Auth:** Passport + JWT access token + rotating refresh token (hashed in DB), bcrypt
- **Authorization:** RBAC — roles, permissions (41), `RolesGuard` / `PermissionsGuard`
- **Validation:** `class-validator` + `class-transformer`
- **API docs:** Swagger UI at `/api/docs`
- **Extras:** audit logging, tenant-scoped access helpers, file uploads (multer, disk storage)

### Mobile
- **Framework:** Flutter (SDK ^3.13.3) — boilerplate scaffold only

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npx prisma migrate dev # create the database schema
npx prisma db seed     # optional demo data + RBAC (super admin + demo school)
npm run start:dev      # http://localhost:8020/api/v1
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8020/api/v1
npm run dev            # http://localhost:3000
```

### Mobile

```bash
cd gyannportal_mobile
flutter pub get
flutter run
```

## API Endpoints

Base URL: `http://localhost:8020/api/v1` · Swagger UI: `http://localhost:8020/api/docs`

### Auth

| Method | Endpoint                          | Description                                        | Auth       |
| ------ | --------------------------------- | -------------------------------------------------- | ---------- |
| GET    | `/health`                         | Health check (API + database)                      | Public     |
| POST   | `/auth/register-school`           | Register a school with admin account               | Public     |
| POST   | `/auth/login`                     | Login → access + refresh token                     | Public     |
| POST   | `/auth/refresh`                   | Rotate refresh token → new token pair              | Refresh    |
| POST   | `/auth/logout`                    | Revoke refresh token(s)                            | JWT        |
| GET    | `/auth/me`                        | Current authenticated user                         | JWT Bearer |
| POST   | `/auth/change-password`           | Change password (revokes all refresh tokens)       | JWT Bearer |

### Platform modules (JWT + role/permission guarded)

`/super-admin`, `/school-admin`, `/schools`, `/branches`, `/academic-years`, `/roles` (`/permissions`), `/users`, `/students`, `/teachers`, `/parents`, `/classes`, `/sections`, `/subjects`, `/courses`, `/enrollments`, `/attendance`, `/assignments`, `/exams`, `/results`, `/notifications`, `/audit-logs`, `/files/upload` — plus role-scoped portal routes (`/students/me`, `/teachers/me`, `/parents/me`).

### Social / community

`/communities`, `/posts`, `/comments`, `/votes`, `/search`, `/feed`.

See `backend/README.md` for the full endpoint reference and example payloads.

## Development Phases

See `phase.md` for the full product roadmap.

- ✅ **Phase 1 — Landing Page & Brand:** Production-ready marketing site
- ✅ **Phase 2 — Backend Foundation:** Prisma schema, Database module, Auth (register/login/refresh/me)
- ✅ **Phase 3 — Core Modules:** Students, Teachers, Attendance, Classes & Sections
- ⚠️ **Phase 4 — Academic:** Exams, Results, Assignments, Subjects, Courses, Enrollments (Timetable still pending)
- ⏳ **Phase 5 — Operations:** Fees, Library, Transport, Hostel
- ⏳ **Phase 6 — Mobile App:** Flutter role-based apps (scaffold only)
- ⏳ **Phase 7 — Analytics & Reports**

Additional shipped work beyond the original roadmap: **RBAC + permissions**, **refresh-token auth**, role-based **web dashboards** (super-admin, school-admin, teacher, student, parent), **notifications**, **audit logs**, **file uploads**, and a **social layer** (communities, posts, comments, votes, search, feed).

## License

© 2026 GyannPortal — Ownalgy Sampanna Tech. All rights reserved.
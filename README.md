# GyannPortal — School Management System

**স्मार्ट विद्यालय, सरल व्यवस्थापन।** One platform to manage your entire school.

GyannPortal is a modern, end-to-end **School Management System** that connects administrators, teachers, students, and parents in one secure and intelligent platform.

## Monorepo Structure

| Directory             | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `frontend/`           | Next.js 16 landing page + web dashboard (TypeScript, Tailwind CSS v4)      |
| `backend/`            | NestJS 12 REST API with Prisma 7 + PostgreSQL                              |
| `gyannportal_mobile/` | Flutter mobile app for Android / iOS / web / desktop                       |

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Fonts:** Geist (via `next/font`)

### Backend
- **Framework:** NestJS 12 (ESM, `"type": "module"`)
- **Database:** PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- **Auth:** Passport + JWT, bcrypt password hashing
- **Validation:** `class-validator` + `class-transformer`

### Mobile
- **Framework:** Flutter (SDK ^3.13.3)

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
npx prisma migrate dev # create the database schema
npm run start:dev      # http://localhost:8000/api/v1
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

### Mobile

```bash
cd gyannportal_mobile
flutter pub get
flutter run
```

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint                | Description                          | Auth       |
| ------ | ----------------------- | ------------------------------------ | ---------- |
| GET    | `/health`               | Health check (API + database)        | Public     |
| POST   | `/auth/register-school` | Register a school with admin account | Public     |
| POST   | `/auth/login`           | Login and receive a JWT token        | Public     |
| GET    | `/auth/me`              | Get current authenticated user       | JWT Bearer |

See `backend/README.md` for the full request/response examples.

## Development Phases

See `phase.md` for the full product roadmap.

- ✅ **Phase 1 — Landing Page & Brand:** Production-ready marketing site
- ✅ **Phase 2 — Backend Foundation:** Prisma schema, Database module, Auth (register/login/me)
- ⏳ **Phase 3 — Core Modules:** Students, Teachers, Attendance, Classes
- ⏳ **Phase 4 — Academic:** Exams, Results, Assignments, Timetable
- ⏳ **Phase 5 — Operations:** Fees, Library, Transport, Hostel
- ⏳ **Phase 6 — Mobile App:** Flutter role-based apps
- ⏳ **Phase 7 — Analytics & Reports**

## License

© 2026 GyannPortal — Ownalgy Sampanna Tech. All rights reserved.
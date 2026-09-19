# GyannPortal — Development Phases & Roadmap

## Phase 1 — Landing Page & Brand ✅

Deliver a production-ready marketing site for GyannPortal.

- ✅ Next.js 16 + TypeScript + Tailwind CSS v4
- ✅ Sticky glass navbar with mobile navigation
- ✅ Hero with Nepali tagline and dashboard mockup
- ✅ Statistics with animated count-up
- ✅ Problem → Solution comparison
- ✅ Features grid (9 modules)
- ✅ Role-based section (Admin / Teacher / Student / Parent)
- ✅ Full dashboard showcase with sample data
- ✅ Mobile app section with phone mockup
- ✅ Security section
- ✅ Pricing (3 tiers)
- ✅ Testimonials, FAQ, final CTA, footer
- ✅ SEO metadata, responsive design, scroll animations
- ✅ Brand colors: Primary `#2563EB`, Secondary `#0F766E`, Accent `#14B8A6`
- ✅ Logo (`logo1.png`) used across the site; footer © GyannPortal — Ownalgy Sampanna Tech

**Done:** role-based web dashboard shipped — see Phases 3–4.

## Phase 2 — Backend Foundation ✅

- ✅ Prisma schema (School, AcademicYear, Branch, User, Role, Permission, RolePermission)
- ✅ Prisma 7 client generation into `src/generated/prisma`
- ✅ Global DatabaseModule / DatabaseService (PrismaPg adapter)
- ✅ AuthModule: register-school, login, refresh, logout, me, change-password
- ✅ JWT strategy (+ refresh strategy) + guards + `@CurrentUser()` decorator
- ✅ DTOs with `class-validator` validation
- ✅ Global ValidationPipe, CORS, `/api/v1` prefix
- ✅ `.env` with `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- ✅ Swagger UI at `/api/docs`, seed script with RBAC + demo school

**Verify:** API boots, DB connects, all three auth routes mapped.

## Phase 3 — Core Entities ✅

- ✅ Student management (CRUD, enrollment, profiles, `students/me` portal)
- ✅ Teacher management (profiles, subjects, classes, `teachers/me` portal)
- ✅ Attendance (daily marking, bulk status, summary reports)
- ✅ Classes & Sections (+ Subjects, Courses, Enrollments incl. bulk)

## Phase 4 — Academic ⚠️ (mostly done)

- ✅ Courses & Subjects
- ✅ Assignments (create, submit, grade submissions)
- ✅ Examinations (CRUD, status workflow)
- ✅ Results (single + bulk create, report data)
- ⏳ **Timetable** (scheduling, conflict detection) — still pending

**Also shipped in this phase:** role-based web dashboards for all 5 roles, RBAC (roles + 41 permissions + guards), refresh-token auth, notifications, audit logs, file uploads.

## Phase 5 — Operations

- Fees & Payments (structure, collection, invoices, outstanding)
- Timetable (scheduling, conflict detection)
- Library (books, borrowing, returns)
- Transport (routes, vehicles)
- Hostel (rooms, allocation)

## Phase 6 — Mobile Application

- Flutter app with role-specific screens
- Push notifications
- Offline-ready data
- Play Store / App Store publishing

## Phase 7 — Analytics & Reports

- Advanced dashboards with charts
- Exportable reports (PDF/Excel)
- Certificates generation
- System-wide notifications
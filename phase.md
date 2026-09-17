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

**Next:** add a web app / dashboard route to the frontend.

## Phase 2 — Backend Foundation ✅

- ✅ Prisma schema (School, AcademicYear, Branch, User, Role, Permission, RolePermission)
- ✅ Prisma 7 client generation into `src/generated/prisma`
- ✅ Global DatabaseModule / DatabaseService (PrismaPg adapter)
- ✅ AuthModule: register-school, login, me
- ✅ JWT strategy + guard + `@CurrentUser()` decorator
- ✅ DTOs with `class-validator` validation
- ✅ Global ValidationPipe, CORS, `/api/v1` prefix
- ✅ `.env` with `JWT_SECRET` / `JWT_EXPIRES_IN`

**Verify:** API boots, DB connects, all three auth routes mapped.

## Phase 3 — Core Entities

- Student management (CRUD, enrollment, profiles)
- Teacher management (profiles, subjects, classes)
- Attendance (daily marking, real-time reports)
- Classes & Sections

## Phase 4 — Academic

- Courses & Subjects
- Assignments (create, submit, grade)
- Examinations (marks, grading, results, report cards)

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
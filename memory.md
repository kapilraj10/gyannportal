# GyannPortal — Memory / Progress Log

## Latest Status (2026-09-17)

### Frontend — Landing Page ✅ **DONE**
Production-ready marketing site implemented in `frontend/`:

- Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4
- 14 sections, all built as reusable components in `components/`:
  `Navbar`, `Hero`, `Stats`, `ProblemSolution`, `Features`, `Roles`,
  `DashboardShowcase`, `MobileApp`, `Security`, `Pricing`, `Testimonials`,
  `FAQ`, `CTA`, `Footer`
- Sticky glass navbar + mobile menu
- Dashboard / phone mockups built with Tailwind (no screenshots)
- IntersectionObserver scroll reveals, animated counters, floating cards
- Animated FAQ accordion
- SEO metadata (title, description, keywords, OpenGraph, Twitter)
- Palette updated to brand colors (Primary `#2563EB`, Accent `#14B8A6`, Secondary `#0F766E`)
- `logo1.png` used across all brand locations; footer: © 2026 GyannPortal — Ownalgy Sampanna Tech
- Fixed React duplicate-key warning in DashboardShowcase calendar header
- ✅ `npm run build` passes, ✅ `eslint` clean

### Backend — Foundation ✅ **DONE**
NestJS 12 API implemented in `backend/`:

- Prisma 7 schema: School, AcademicYear, Branch, User, Role, Permission, RolePermission
- Global `DatabaseModule` / `DatabaseService` (PrismaPg adapter)
- `AuthModule` with:
  - `POST /api/v1/auth/register-school` — transactional school+admin+branch creation
  - `POST /api/v1/auth/login` — JWT issuance with status checks
  - `GET  /api/v1/auth/me` — current user (JWT protected)
- DTOs with `class-validator` (whitelist + forbidNonWhitelisted + transform)
- `JwtStrategy`, `JwtAuthGuard`, `@CurrentUser()` decorator
- Installed deps: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `class-validator`, `class-transformer`
- Added `JWT_SECRET` + `JWT_EXPIRES_IN` to `.env` / `.env.example`
- ✅ `npm run build` passes, ✅ `oxlint` clean, ✅ app boots & maps all routes

### Mobile — Flutter
`gyannportal_mobile/` is a fresh Flutter project — not yet implemented.

## Known Environment Notes

- Backend port `8000` may already be in use in dev (EADDRINUSE) — check running processes.
- Database must be running for the API to boot (DatabaseService connects on init).

## Next Steps

1. Phase 3: Student / Teacher / Attendance CRUD
2. Phase 4: Exams, Results, Assignments, Timetable
3. Dashboard route in the frontend web app (not just landing page)
4. Flutter screens wired to the API

## Decisions

- ESM everywhere on backend → imports need `.js` suffix.
- @nestjs/passport v12 requires `PassportModule.register({ defaultStrategy: 'jwt' })`.
- Prisma 7 `prisma-client` generator committed to `src/generated/prisma`.
- Landing page stays light-theme only (no dark mode) — enterprise schooling context.
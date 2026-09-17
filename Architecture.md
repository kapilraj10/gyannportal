# GyannPortal — System Architecture

## 1. High-Level Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend (web) │     │   Backend API    │     │    Database     │
│  Next.js 16     │────▶│   NestJS 12      │────▶│  PostgreSQL     │
│  Tailwind v4    │     │   Prisma 7       │     │  (adapter-pg)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
┌─────────────────┐                 ▲
│  Mobile App     │─────────────────│
│  Flutter        │   HTTPS + JWT   │
└─────────────────┘                 │
```

## 2. Repository Layout

```
gyannportal/
├── frontend/            # Landing page (marketing site)
├── backend/             # REST API (monolithic NestJS)
└── gyannportal_mobile/  # Flutter multi-platform app
```

## 3. Backend Architecture

```
src/
├── main.ts                      # Bootstrap: ValidationPipe, CORS, /api/v1 prefix
├── app.module.ts                # Root module: Config, Database, Auth
├── app.controller.ts            # GET / and GET /health
├── database/
│   ├── database.module.ts       # @Global() module
│   └── database.service.ts      # Extends PrismaClient (PrismaPg adapter)
├── generated/
│   └── prisma/                  # Generated Prisma 7 client (commit to repo)
├── auth/
│   ├── auth.controller.ts       # register-school, login, me
│   ├── auth.service.ts          # Business logic
│   ├── auth.module.ts           # JwtModule, PassportModule, ConfigModule
│   ├── dto/
│   │   ├── register-school.dto.ts
│   │   └── login.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts    # AuthGuard('jwt')
│   └── strategies/
│       └── jwt.strategy.ts      # Passport JWT strategy
└── common/
    └── decorators/
        └── current-user.decorator.ts  # @CurrentUser() param decorator
```

## 4. Data Model (Prisma)

- **School** — `1 : N` AcademicYear, Branch, User
- **AcademicYear** — belongs to School, unique per `schoolId + name`
- **Branch** — belongs to School, unique per `schoolId + name`
- **User** — belongs to School (required) and Branch (optional); has one Role
- **Role** — `M : N` Permission via RolePermission join table
- **Permission** — role-based access permissions

### Enums

`SchoolType`, `SchoolLevel`, `SchoolStatus`, `AcademicYearStatus`, `BranchStatus`, `UserStatus`

Prisma generator: `prisma-client` (ESM) writing to `src/generated/prisma`.

## 5. Authentication Flow

1. **Register** → create `Role (SCHOOL_ADMIN)`, `School`, optional `Branch`, `User` in a **transaction** → return JWT.
2. **Login** → verify email/password → check `UserStatus.ACTIVE` and `SchoolStatus.ACTIVE` → return JWT + profile.
3. **Protected routes** → `JwtAuthGuard` extracts bearer token via `JwtStrategy` → payload exposes `{ userId, email, schoolId, roleId, role }` to `@CurrentUser()`.

### JWT Payload

```
{ sub, email, schoolId, roleId, role }
```

## 6. Environment Configuration

`.env` / `.env.example`:

```
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/gyannportal_db?schema=public"
JWT_SECRET="<long-random-secret>"
JWT_EXPIRES_IN="7d"
```

## 7. Naming & Conventions

- **ESM:** `"type": "module"` in `package.json`; all relative imports use `.js` suffix.
- **Prisma:** generated client imported from `../generated/prisma/client.js`; enums are both values and types.
- **Password hashing:** bcrypt, cost 12.
- **Errors:** Nest exceptions (`ConflictException`, `UnauthorizedException`).
- **Validation:** DTOs decorated with `class-validator`.

## 8. Security

- JWT bearer authentication
- bcrypt password hashing
- `ValidationPipe` with whitelist (prevents mass assignment)
- CORS restricted to development origins
- Database access via singleton `DatabaseService` (PrismaPg adapter)

## 9. Future Considerations

- Add module-per-domain folders (students, attendance, fees, etc.)
- Role-based guards beyond authentication (`RolesGuard` + `@UseRoles`)
- Paged list endpoints with query DTOs
- Event-driven notifications (announcements, push)
- Rate limiting and request logging
- Horizontal scaling via Stateless JWT
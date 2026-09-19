# GyannPortal — Project Rules & Conventions

## General

- **Language:** English for code, identifiers, and UI. Nepali only for the brand tagline (`स्मार्ट विद्यालय, सरल व्यवस्थापन।`).
- **Quality:** Code must pass lint and typecheck before it is considered done.
- **No secrets:** Never commit real secrets. `.env` is gitignored; ship `.env.example` instead.

## Frontend (Next.js)

- TypeScript with **strict** mode.
- Tailwind CSS v4 utility classes; custom tokens in `@theme inline` inside `globals.css`.
- Components live in `components/`, pages in `app/`.
- Use `next/image` for all images (never a plain `<img>`).
- Mark interactive components with `"use client"`; the landing page (`app/page.tsx`) is client-side and composes client sections.
- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`, `button`, `a`).
- Add `aria-*` attributes for interactive elements; unique React keys at all times.
- Scroll animations via `IntersectionObserver` helpers inside components.

## Brand Colors

| Token      | Usage              | Hex       |
| ---------- | ------------------ | --------- |
| Primary    | Brand blue         | `#2563EB` |
| Secondary  | Teal               | `#0F766E` |
| Accent     | Cyan/Teal          | `#14B8A6` |
| Background | Light surface      | `#F8FAFC` |
| Text       | Dark navy          | `#0F172A` |
| Success    | Positive states    | `#16A34A` |
| Warning    | Notices            | `#F59E0B` |
| Error      | Errors             | `#DC2626` |

## Backend (NestJS)

- ESM project: `"type": "module"` — **every relative import must end with `.js`**.
- Prisma 7 generated client: import from `../generated/prisma/client.js` (enums are both values and types; `Role` is a model type).
- Use `class-validator` DTOs for every request body; decorate with both value and type usage correctly.
- Import `bcrypt` as `import bcrypt from 'bcrypt'` (CJS interop).
- `PassportModule.register({ defaultStrategy: 'jwt' })` is REQUIRED in @nestjs/passport v12 or guards fail to resolve.
- Wrap multi-step writes (role + school + branch + user) in `prisma.$transaction`.
- Normalize user input: trim strings, uppercase `schoolCode`, lowercase emails.
- Throw semantic HTTP exceptions (`ConflictException`, `UnauthorizedException`, `BadRequestException`).
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.

## Commands

### Backend
```bash
cd backend
npm run build      # nest build (tsc)
npm run start:dev  # watch mode
npm run lint       # oxlint --type-aware src/ test/
npx prisma migrate dev   # apply schema changes
npx prisma generate      # regen client after schema edit
```

### Frontend
```bash
cd frontend
npm run dev    # next dev
npm run build  # next build
npm run lint   # eslint
```

### Mobile
```bash
cd gyannportal_mobile
flutter pub get
flutter analyze
flutter test
```
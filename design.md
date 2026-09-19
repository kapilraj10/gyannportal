# GyannPortal — Design System

## 1. Brand

- **Name:** GyannPortal
- **Tagline (Nepali):** स्मार्ट विद्यालय, सरल व्यवस्थापन
- **Tagline (English):** One platform to manage your entire school.
- **Category:** School Management System / Software (SaaS)

## 2. Color Palette

| Token     | Value     | Usage                                     |
| --------- | --------- | ----------------------------------------- |
| Primary   | `#2563EB` | Brand blue — buttons, links, accents      |
| Secondary | `#0F766E` | Teal — supporting surfaces                |
| Accent    | `#14B8A6` | Cyan/Teal — gradients, highlights         |
| Background| `#F8FAFC` | Page light background                     |
| Text      | `#0F172A` | Dark navy — headings & body               |
| Success   | `#16A34A` | Attendance/payment positive states        |
| Warning   | `#F59E0B` | Notices, pending items                    |
| Error     | `#DC2626` | Alerts, outstanding balances              |

- Primary gradients: `linear-gradient(135deg, #2563eb, #14b8a6)`.
- Hero background: `linear-gradient(135deg, #eff6ff, #f0fdfa, #ffffff)`.

## 3. Typography

- **Font:** Geist Sans (`--font-geist-sans`) via `next/font`.
- Headings: bold, tight tracking (`tracking-tight`), large (`text-3xl` → `text-6xl`).
- Body: `text-base`/`text-lg`, `text-slate-500`/`text-slate-600` on white.
- Hero headline uses a blue → teal **gradient text** on the highlighted phrase.

## 4. Layout

- Max width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Section padding: `5rem` mobile / `7rem` desktop (`.section-padding`).
- Grid-based feature/role/testimonial layouts (`grid sm:grid-cols-2 lg:grid-cols-3 gap-6`).

## 5. Components

### Cards
- `rounded-2xl`, `border-slate-100`, white background.
- Soft shadows: `.card-shadow` (small) and `.card-shadow-lg` (large).
- Hover: subtle `-translate-y-1` lift + `hover:shadow-lg`.

### Buttons
- **Primary:** `bg-primary-500 text-white rounded-xl hover:bg-primary-600`, hover shadow + `active:scale-[0.97]`.
- **Secondary:** white background, `border-slate-200`, hover surface tint.
- **Ghost / link:** text colored, hover tint.

### Badges (section labels)
- `rounded-full`, `bg-primary-50`, `border border-primary-100`, small `text-primary-600` label.

### Navbar
- Fixed top; transparent over hero; **glass blur** (`backdrop-filter: blur(20px)`) once scrolled.
- Mobile: hamburger → full-screen overlay menu.

## 6. Motion & Interaction

- `IntersectionObserver` reveals sections with `opacity-0` + `.animate-fade-up`.
- Floating dashboard cards: `animate-float` / `animate-float-delayed` (6s ease).
- Animated number counters on statistics.
- FAQ accordion: grid-rows trick for smooth height transition.
- Keep animations subtle — no infinite decorative noise (except gentle floating cards).

## 7. Imagery & Icons

- Icons via **`lucide-react`** (stroke icons); landing scroll-reveal via `IntersectionObserver` in `components/shared/Reveal.tsx`.
- Logo file: `frontend/public/logo1.png` (used across navbar, dashboards, footer).
- Dashboard mockups are hand-built with Tailwind, not screenshots.

## 8. Accessibility

- Semantic landmarks (`nav`, `main`, `section`, `footer`).
- `aria-label` on icon-only buttons; `aria-expanded` on accordions.
- Color contrast: dark slate text on white / light surfaces.
- Focus-visible states via Tailwind default focus rings where needed.
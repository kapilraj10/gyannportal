# GyannPortal — Frontend (Next.js Landing Page)

The marketing landing page for GyannPortal — a premium School Management System.

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Geist font

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build and lint:

```bash
npm run build
npm run lint
```

## What's Included

A single-page marketing site with 14 sections:

1. **Navbar** — fixed glass/blur navbar, mobile menu, Login + Get Started
2. **Hero** — Nepali tagline, CTAs, dashboard mockup with floating cards
3. **Stats** — animated counters (500+, 50+, 99.9%, 24/7)
4. **Problem → Solution** — before/after comparison
5. **Features** — 9-module responsive grid
6. **Roles** — Admin / Teacher / Student / Parent cards
7. **Dashboard Showcase** — full dashboard mockup with sidebar, charts, calendar
8. **Mobile App** — phone mockup and app feature list
9. **Security** — enterprise security feature cards
10. **Pricing** — Starter / Professional / Enterprise
11. **Testimonials** — admin, teacher, parent
12. **FAQ** — accessible accordion
13. **Final CTA** — gradient banner
14. **Footer** — links, social icons, legal

## Project Layout

```
app/
├── globals.css      # Tailwind v4 theme tokens, keyframes, utilities
├── layout.tsx       # Metadata (SEO), fonts, root shell
└── page.tsx         # Composes all sections (server component)
components/          # One file per section + Navbar/Footer
public/
└── logo1.png        # Brand logo used site-wide
```

## Styling

- Brand colors defined in `globals.css` `@theme inline`:
  Primary `#2563EB`, Secondary `#0F766E`, Accent `#14B8A6`,
  Background `#F8FAFC`, Text `#0F172A`, plus success/warning/error scales.
- Custom utilities: `.gradient-text`, `.card-shadow`, `.glass`, `.section-padding`.
- Icons are inline SVGs (no icon library dependency).

## Notes

- Interactive components use `"use client"`; the page itself stays a server component.
- Scroll-reveal animations use `IntersectionObserver`.
- All images (including the logo) go through `next/image`.
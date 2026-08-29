# Changelog

## Phase 0 — Repository and foundation

- Initialized Git repository with `main` and `perez` branches.
- Scaffolded Next.js + TypeScript + Tailwind CSS frontend with initial design tokens and a
  landing shell.
- Added linting (ESLint), formatting (Prettier), and test runners (Vitest + React Testing
  Library) with passing smoke tests.
- Added GitHub Actions CI pipeline.
- Added initial documentation.

## Architecture pivot — Next.js-only, Vercel-first

- Retired the separate Flask/SQLAlchemy backend in favor of Next.js Route Handlers, so the whole
  platform deploys as a single Vercel project against a serverless Postgres database (Neon).
- Added Prisma ORM with a full schema: `User`, `WaterPoint`, `Report`, `MaintenanceLog`,
  `AuditLog`.
- Added a deterministic seed script producing 62 fictional water points, 24 users, and hundreds
  of fictional reports/maintenance logs.

## Phases 1–11 — Full feature build

- **Design system & public shell:** nav, footer, design tokens, accessible skip link.
- **Public directory:** searchable/filterable water point list and detail pages with report
  history and maintenance history.
- **Data layer:** Prisma schema, seed script, Route Handlers for water points/reports.
- **Auth & roles:** credentials auth (bcrypt + JWT session cookie), `ADMIN`/`CARETAKER`/`MEMBER`
  roles, Edge middleware route protection.
- **Community reporting:** public report submission form with rate limiting.
- **Caretaker tools:** per-caretaker dashboard, status updates, maintenance logging.
- **Admin tools:** user management (role changes), activity/audit log feed.
- **Analytics & exports:** status/issue/village charts (Recharts), CSV export of all water
  points.
- **Security hardening:** security headers + CSP, input validation on every endpoint, per-IP
  rate limiting, audit logging, documented known limitations.
- **SEO, accessibility, performance:** metadata API, sitemap/robots, OpenGraph tags, semantic
  HTML/ARIA labeling, reduced-motion support.
- **Release preparation:** documentation reorganized into `docs/`, recruiter-facing root
  README, Vercel + Neon deployment guide.

# Development Plan

# Development Plan

Tracks phase-by-phase progress for WaterPoint Board Uganda. Each phase must pass its checks before the next phase begins.

## Branch workflow

`feature/*` or `chore/*` or `fix/*` → `perez` (integration) → `main` (production). Never push directly to `main`. Never force-push to `main` or `perez`.

## Architecture note

Phase 0 originally scaffolded a separate Flask backend. Starting with Phase 1, the project
pivoted to a **Next.js-only** architecture (Route Handlers instead of a separate API service) so
the whole platform can deploy as a single Vercel project against a serverless Postgres database
(Neon). See [docs/ARCHITECTURE.md](ARCHITECTURE.md) for the rationale.

## Phases

- [x] **Phase 0 — Repository and foundation**
  - Git repository initialized, `main` and `perez` branches created and pushed.
  - Next.js + TypeScript + Tailwind frontend scaffolded (App Router, `src/` dir).
  - Docker Compose for local Postgres.
  - Environment variable templates (`.env.example`).
  - Linting (ESLint) and formatting (Prettier) configured.
  - Test runners configured (Vitest + Testing Library) with a passing smoke test.
  - GitHub Actions CI pipeline.
  - Initial documentation (README, this development plan).
- [x] **Phase 1 — Original design system and public shell**
  - Design tokens, nav bar, footer, accessible skip link, landing page with feature highlights.
- [x] **Phase 2 — Public directory**
  - `/water-points` searchable/filterable list, `/water-points/[id]` detail page with reports and
    maintenance history.
- [x] **Phase 3 — Data layer (Prisma + Postgres, replacing the Flask API)**
  - Full Prisma schema (`User`, `WaterPoint`, `Report`, `MaintenanceLog`, `AuditLog`).
  - Deterministic seed script (62 water points, 24 users, hundreds of reports/logs).
  - Route Handlers for water points and reports.
- [x] **Phase 4 — Authentication and roles**
  - Credentials auth (bcrypt + `jose`-signed JWT session cookie), `ADMIN`/`CARETAKER`/`MEMBER`
    roles, Edge middleware protecting `/dashboard/*` by role.
- [x] **Phase 5 — Community reporting**
  - Public report submission form (rate-limited), report history on the detail page.
- [x] **Phase 6 — Caretaker tools**
  - Per-caretaker dashboard: assigned water points, open reports, status updates, maintenance
    logging.
- [x] **Phase 7 — Admin tools**
  - User management (role changes), audit/activity feed.
- [x] **Phase 8 — Analytics and exports**
  - Status/issue/village charts (Recharts), CSV export of all water points.
- [x] **Phase 9 — Security hardening**
  - Security headers + CSP (`next.config.ts`), Zod validation on every endpoint, per-IP rate
    limiting, audit logging, documented known limitations in `docs/SECURITY.md`.
- [x] **Phase 10 — SEO, accessibility, and performance**
  - Metadata API, `sitemap.ts`/`robots.ts`, OpenGraph/Twitter tags, semantic HTML/ARIA labels,
    reduced-motion support, skip-to-content link.
- [x] **Phase 11 — Release preparation**
  - Documentation reorganized into `docs/`, recruiter-facing root README, Vercel + Neon
    deployment guide, CI updated for the Next.js-only architecture.

## Required checks before merging a feature branch into `perez`

- Frontend lint, TypeScript check, unit tests, production build.
- Prisma schema validation.
- Manual verification that no critical flow is broken.

## Required checks before merging `perez` into `main`

All of the above, plus: a `prisma db push` + seed dry run against a disposable database, and a
manual smoke test of the public directory, auth, reporting, caretaker, and admin flows.


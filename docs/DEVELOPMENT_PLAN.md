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
- [x] **Phase 12 — Post-launch bug fixes, mobile responsiveness, and hardening pass**
  - Fixed the public map not rendering tiles: CSP `img-src` was silently blocking
    `*.tile.openstreetmap.org` image requests.
  - Fixed pie/donut chart legends overlapping card borders on the Map & Insights page.
  - Water points directory: 3-per-row responsive grid (was single-column rows) and windowed/
    ellipsis pagination (`1 2 3 … N`) instead of listing every page number.
  - Login page: decluttered overlapping demo account credentials into a clean list with
    one-click "Use account" autofill per role.
  - Home page hero: replaced the CSS-gradient hero with a real, license-verified 4-photo
    crossfading slideshow of Uganda water access (Wikimedia Commons, CC0/CC-BY-SA 4.0),
    with a `/copyright` attribution section for each image.
  - Added a mobile-first, iOS-style fixed bottom tab bar (`BottomNav`) shown below the `sm`
    breakpoint, with role-aware tabs (Home/Water Points/Map/About plus Caretaker/Admin/Log in),
    safe-area-inset padding, and active-route highlighting; the existing top nav remains
    unchanged on larger screens.
  - Database: added the missing `WaterPoint.type` index (frequently filtered, previously
    unindexed) and re-verified all other models already have appropriate indexes/foreign keys.
  - Fixed a `package.json` dependency-drift bug where pinned versions (Prisma 6.19.3,
    leaflet/react-leaflet) had fallen out of sync with `package-lock.json`/`node_modules`.
  - Top nav bar: fixed the mobile Log in/Sign up buttons wrapping/distorting on narrow
    viewports (brand text and buttons were competing for space with no `shrink-0`/
    `whitespace-nowrap`); brand text now abbreviates to "WaterPoint" below the `sm`
    breakpoint and buttons keep a fixed, neat pill size at every width.
  - Hardening pass: added a `Strict-Transport-Security` header, a safety-cap (`take: 2000`)
    on the unbounded `/api/water-points` query, and a `/api/health` liveness endpoint for
    uptime monitoring.

## Required checks before merging a feature branch into `perez`

- Frontend lint, TypeScript check, unit tests, production build.
- Prisma schema validation.
- Manual verification that no critical flow is broken.

## Required checks before merging `perez` into `main`

All of the above, plus: a `prisma db push` + seed dry run against a disposable database, and a
manual smoke test of the public directory, auth, reporting, caretaker, and admin flows.


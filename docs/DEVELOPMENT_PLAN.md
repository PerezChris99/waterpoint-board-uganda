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
- [x] **Phase 13 — Role-based dashboards, map overhaul, and performance/quality pass**
  - Login/registration now redirect straight to a role-specific dashboard (`/dashboard/admin`,
    `/dashboard/caretaker`, `/dashboard/member`) instead of the public home page; added a new
    Member dashboard showing a user's own submitted reports with live status and caretaker
    resolution notes.
  - Replaced Leaflet + raster OpenStreetMap tiles with **MapLibre GL JS** (WebGL vector-tile
    rendering) using the free, no-API-key **OpenFreeMap** "liberty" style — noticeably faster
    pan/zoom than DOM-based raster tiles.
  - Map now has a working **"find my location"** control (browser geolocation), a **nearest
    water points** list computed client-side (haversine distance) once location is shared, and
    real **road-network-accurate routing** (not a straight line) from the user to a selected
    water point via the free public **OSRM** demo routing API — documented as a light-use-only
    dependency, see Known limitations in `docs/SECURITY.md`.
  - Fixed the mobile top-nav Log in/Sign up buttons wrapping/distorting on narrow viewports.
  - Added a real water-droplet browser tab icon (`icon.svg`), removing the default Next.js logo
    favicon.
  - Re-sourced hero photos from their true, full-resolution Wikimedia Commons originals (two of
    the four images had been serving needlessly downscaled 960×540 copies) and re-compressed all
    four with mozjpeg at quality 82 — sharper on wide screens and smaller on the wire.
  - Added `loading.tsx` route-level skeletons on every data-heavy page (water points, map, water
    point detail, all dashboards) so navigation shows instant feedback instead of a blank page
    while the server component fetches data.
  - CSP updated for the map change: dropped the now-unused OpenStreetMap raster tile `img-src`
    allowance, added `connect-src` entries for OpenFreeMap/OSRM and a `worker-src`/`child-src
    blob:` allowance required by MapLibre GL's web worker.
- [x] **Phase 14 — Geolocation auto-prompt, page redesigns, and legal updates**
  - Fixed a `Permissions-Policy: geolocation=()` header left over from the Phase 12 hardening
    pass that was silently blocking the Geolocation API for the page origin — the browser
    permission prompt could never appear no matter what the map code did. Changed to
    `geolocation=(self)`.
  - The map page now calls `GeolocateControl.trigger()` as soon as the map style finishes
    loading, so visitors are prompted for location automatically on page open instead of having
    to find and click the location button first.
  - Tuned `positionOptions` (`enableHighAccuracy: true`, `maximumAge: 0`, `timeout: 15000`) to
    always request a fresh, GPS-grade device fix rather than a cached or network-derived one, and
    surfaced the device-reported accuracy (in metres) next to the nearest-water-points list for
    transparency.
  - Redesigned the About page into a newspaper-style two-column layout (with a drop-cap opening
    paragraph) for the main story, followed by a new animated, scroll-triggered timeline
    (`AnimatedTimeline` component, IntersectionObserver-based, respects
    `prefers-reduced-motion`) walking through how a report becomes a fix.
  - Redesigned the water point detail page: the overview, report form, recent reports, and
    maintenance history are now four cards in a responsive 2×2 grid instead of stacked
    full-width sections.
  - Updated the Privacy Policy, Terms of Service, and Copyright & Licensing pages to disclose the
    map's use of device geolocation (opt-in, browser-only, never stored server-side) and to
    credit/disclaim the third-party MapLibre GL, OpenFreeMap, OpenStreetMap, and OSRM services.

## Required checks before merging a feature branch into `perez`

- Frontend lint, TypeScript check, unit tests, production build.
- Prisma schema validation.
- Manual verification that no critical flow is broken.

## Required checks before merging `perez` into `main`

All of the above, plus: a `prisma db push` + seed dry run against a disposable database, and a
manual smoke test of the public directory, auth, reporting, caretaker, and admin flows.


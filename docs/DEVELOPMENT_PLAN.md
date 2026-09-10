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
- [x] **Phase 15 — Nationwide seed data, logout bug fix, footer cleanup, security audit**
  - Fixed logout redirecting to `localhost` in production: `POST /api/auth/logout` derived its
    redirect target from `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`; now
    builds the redirect from the incoming request's own origin (`new URL("/", request.url)`)
    instead, removing the env-var dependency entirely.
  - Reworked `prisma/seed.ts`'s geography: water points were previously jittered around a single
    fictional coordinate (a ~20km box), giving the impression of one clustered community. Water
    points (now 153, up from 62) are generated across 24 real Ugandan towns/cities and all five
    Kampala divisions, using each location's real approximate centre coordinates with a small
    (~3km) jitter — weighted more heavily around Kampala/Wakiso/Entebbe/Mukono, matching real
    population density, while still covering the north (Gulu, Lira, Arua, Kitgum, Moroto), east
    (Jinja, Mbale, Tororo, Soroti, Iganga), and west (Mbarara, Kabale, Fort Portal, Kasese,
    Hoima, Masaka). Site-level names/details remain fictional demo data. Reseeded the shared
    Neon database with the new distribution (153 water points, 338 reports, 301 maintenance
    logs, 24 users).
  - Map page: default zoom is now a whole-country view (was zoom 12, a city-block level) and the
    map automatically fits its bounds to every loaded water point on load, instead of assuming a
    single local cluster.
  - Footer: removed the redundant plain-text "Contact" column (email/phone/WhatsApp written out
    as literal text) — the icon-based contact row (WhatsApp/Email/Call) in the brand column is
    now the sole contact surface. Updated `privacy`/`copyright` page wording that referenced
    "the details in the footer" to specifically say "the contact icons in the site footer".
  - Conducted a deep-dive security review of the auth/session/RBAC/validation/rate-limit code
    and every API route; see `docs/SECURITY.md` for the full write-up of findings (strengths and
    remaining risks).
- [x] **Phase 16 — Session revocation, account-aware rate limiting, 404 fix**
  - Added a `tokenVersion Int @default(0)` column on `User`, embedded in every signed session
    JWT. `requireRole()` (every mutating API route) and a new `getVerifiedSession()` helper
    (every dashboard page's own server-side role gate, plus `/api/auth/me`) now re-check the
    live `tokenVersion` against the database on each request/render, rejecting the session if it
    doesn't match — closing the gap where a copied/leaked token or a demoted user's stale role
    claim stayed valid for the rest of the JWT's 7-day life.
  - `POST /api/auth/logout` now increments the caller's `tokenVersion` before clearing the
    cookie, so that specific token is rejected server-side immediately, not just once the cookie
    is gone client-side.
  - `PATCH /api/admin/users/[id]` now increments the target user's `tokenVersion` in the same
    update as the role change, so their already-issued token stops carrying stale permissions
    right away.
  - `POST /api/auth/login` now enforces a second, account-scoped rate limit (keyed by normalized
    email, alongside the existing per-IP limit), mitigating distributed credential-stuffing
    against one account from many IPs.
  - `PATCH /api/admin/users/[id]` now returns a clean 404 for a non-existent user id instead of
    falling through to a generic 500.
  - Updated `docs/SECURITY.md` to reflect findings 2, 4, and 6 as fixed.
- [x] **Phase 17 — Design blueprint adoption and anti-AI-generic audit**
  - Added `docs/DESIGN_BLUEPRINT.md`, the standing design/implementation standard for this
    project going forward — an anti-"vibe-coded" checklist (no default purple/blue gradients,
    no decorative glow blobs, no emoji-as-icon, restrained motion, product-specific visual
    language) to be applied to all future UI work.
  - Audited the existing layout/components against it. Findings and fixes:
    - `AuthShell` (login/register side panel) had two purely decorative blurred glow blobs
      (`blur-3xl` circles) with no informational value — removed.
    - The 💧 emoji was used as the brand mark in the nav bar, footer, and `AuthShell` — replaced
      with a new shared `BrandMark` SVG component (a simple droplet glyph) for consistent,
      platform-independent rendering, matching the custom-SVG icon system already used
      elsewhere (e.g. `BottomNav`'s `DropletIcon`).
    - Stale water-point counts left over from before the Phase 15 reseed ("62" in `AuthShell`'s
      stat highlights, "60+" in the About page, "~62" in `docs/DEPLOYMENT.md`) corrected to the
      current 153-point dataset.
    - Everything else audited (home page structure, hero, status badges, charts, forms,
      navigation, dashboards) was already consistent with the blueprint — semantic color
      tokens, restrained single-use motion (hero parallax respects `prefers-reduced-motion`,
      timeline reveal is on the blueprint's own allowed-list), custom SVG icons, and no
      pill-badge/gradient-text/glassmorphism-everywhere patterns — so left unchanged.

## Production roadmap (portfolio → real pilot)

Starting with Phase 18, the project is moving from a portfolio/demo posture toward something a
real institutional pilot (a district water office, an NGO, or NWSC's rural-expansion program)
could actually use. Each numbered phase below maps to a stage in
[docs/NWSC-PRODUCTION-STRATEGY.md](NWSC-PRODUCTION-STRATEGY.md#3-recommended-phased-roadmap)'s
"Phase 0–4" plan; the phase numbers here continue the existing repo-wide sequence so history
stays linear.

- [x] **Phase 18 — Production strategy & problem audit (roadmap "Phase 0": positioning, no code)**
  - Added `docs/NWSC-PRODUCTION-STRATEGY.md`: a sourced audit of Uganda's water sector (who
    governs piped/urban vs. rural point-source water — NWSC vs. District Local
    Governments/MWE/DWD), the documented problems this platform can plausibly help with
    (no real-time rural water-point functionality data, slow caretaker/HPMA accountability, no
    public transparency layer, fragmented feedback loops), what NWSC already owns and this
    project must never duplicate or overclaim (billing, water-quality certification, network
    SCADA), and a gap analysis from demo to real pilot (data provenance, tenancy/org model,
    moderation queue, offline/SMS reach, legal/DPA-2019 compliance).
  - Reframed `README.md`'s scope note and `docs/DATA-METHODOLOGY.md` from "portfolio/demonstration
    project" to a production-readiness track that explicitly complements (never replaces) NWSC
    and MWE, while keeping every existing "this is not a certification/regulatory system"
    disclaimer intact — the honesty discipline carries forward unchanged.
  - No schema or application code changed in this phase — it is intentionally research/positioning
    only, so that Phases 19+ (data provenance fields, org/tenancy model, moderation, reach) build
    against validated requirements instead of assumptions.
- [x] **Phase 19 — Data provenance fields (roadmap "Phase 1a")**
  - Added a `VerificationMethod` enum (`FIELD_VISIT`, `DISTRICT_SURVEY`, `CARETAKER_UPDATE`,
    `COMMUNITY_REPORT`, `ADMIN_OVERRIDE`, `SELF_REPORTED`) and `verificationMethod`/`verifiedById`
    fields on `WaterPoint` (nullable — additive, non-breaking schema change).
  - `PATCH /api/water-points/[id]` now records who confirmed a status change and how
    (`CARETAKER_UPDATE` vs `ADMIN_OVERRIDE`) every time status is updated, alongside the existing
    `lastVerifiedAt` timestamp.
  - Public water point detail page and the admin CSV export both surface the new provenance
    fields. Seed data populates them deterministically (points still `NEEDS_VERIFICATION` stay
    unverified/null, matching existing `lastVerifiedAt` behavior).
  - Framed explicitly as data provenance, not a quality certification — `docs/DATA-METHODOLOGY.md`
    updated with a "Data provenance" section.
- [x] **Phase 20 — Organization/tenancy model (roadmap "Phase 1b")**
  - Added an `Organization` model (`name`, `type` — district local government / NWSC rural unit /
    NGO / other — `contactEmail`) and a nullable `organizationId` FK on both `User` and
    `WaterPoint` (additive, non-breaking schema change). No existing seed data was reassigned —
    an `organizationId === null` user/water point is treated as platform-wide/demo data.
  - `getVerifiedSession()` now re-reads `organizationId` fresh from the database on every request
    (same pattern already used for `role`/`tokenVersion`), so a real org reassignment takes effect
    immediately without forcing re-login. Added `organizationScopeWhere()` in `src/lib/rbac.ts`:
    an ADMIN/CARETAKER with no organization is a platform-wide super-admin (sees everything); one
    assigned to an organization is scoped to only that organization's data.
  - Applied this scoping to every admin-facing read/write surface: `/api/admin/users` (list +
    role-update, both list and update now 404/403 across org boundaries), `/api/water-points/[id]`
    PATCH (an org-scoped admin can't update another org's water point), `/api/analytics/summary`,
    `/api/analytics/export`, and the equivalent server-rendered admin dashboard pages
    (`/dashboard/admin/users`, `/dashboard/admin/analytics`). Public read routes (the directory,
    map, and water point detail pages) are intentionally untouched — this platform's public
    transparency board still shows all data regardless of organization.
  - Seed data adds 3 sample Organizations to prove the model end-to-end without disturbing the
    existing deterministic dataset.
- [x] **Phase 21 — Moderation queue for anonymous reports (roadmap "Phase 2a")**
  - Added a `ModerationStatus` enum (`PENDING_REVIEW`, `APPROVED`, `REJECTED`) and
    `moderationStatus` field on `Report`, defaulting to `APPROVED`. `POST /api/reports` now sets
    it to `PENDING_REVIEW` for anonymous (unauthenticated) submissions and `APPROVED` for
    submissions from a logged-in account.
  - Public-facing surfaces (`/water-points/[id]` detail page, `/api/public/insights`) now only
    ever show `APPROVED` reports/report-derived stats — a pending or rejected anonymous claim is
    invisible to the public until moderated.
  - Caretaker/admin dashboards and `GET /api/reports` still show every report, including pending
    ones (with a "Pending review" badge), plus new Approve/Reject actions
    (`ReportModerationActions` component, `moderationStatus` field on the existing
    `PATCH /api/reports/[id]` endpoint). Moderation actions respect the same caretaker-ownership
    and organization-scoping rules as status updates.
  - Seed data now produces a realistic mix of already-approved and a handful of freshly
    `PENDING_REVIEW` anonymous reports so the moderation queue is visible out of the box.
- [x] **Phase 22 — Escalation + notifications (roadmap "Phase 2b")**
  - Added `src/lib/escalation.ts`: a report `OPEN`/`ACKNOWLEDGED` for more than 14 days
    (`ESCALATION_THRESHOLD_DAYS`) is "escalated" — computed on read, no new schema field, no
    scheduled job required for this part. Surfaced in the caretaker/admin dashboard with a red
    "Escalated" label. Has dedicated unit tests (`escalation.test.ts`).
  - Added `src/lib/notifications.ts`: a provider-agnostic `sendNotification()` that calls Resend's
    HTTP API directly (no new dependency) when `RESEND_API_KEY` is set, and otherwise safely logs
    and no-ops — nothing breaks in an unconfigured environment (including this sandbox, which has
    no real email credentials).
  - `POST /api/reports` now best-effort emails the assigned caretaker whenever a new report comes
    in for their water point (failures are swallowed, never block report submission).
  - Added `GET /api/cron/escalations`: a `CRON_SECRET`-gated digest endpoint (401/deny-by-default
    if the secret is unset or wrong) that emails each caretaker a summary of their currently
    escalated reports. Wired to Vercel Cron via `frontend/vercel.json` (daily at 06:00 UTC).
    Documented in `docs/DEPLOYMENT.md` along with the new optional env vars in `.env.example`.
- [x] **Phase 23 — SMS + USSD (roadmap "Phase 3a")**
  - Added `phone String?` to `User` (additive, nullable) so caretakers can optionally receive SMS
    in addition to email; seed data gives each demo caretaker a fictional Uganda-format number.
  - Added `src/lib/sms.ts`: a provider-agnostic `sendSms()` calling Africa's Talking's HTTP API
    directly (no new dependency) when `AFRICAS_TALKING_API_KEY`/`AFRICAS_TALKING_USERNAME` are
    set, and otherwise safely logging and no-oping — same pattern as `sendNotification()`. Wired
    into both `POST /api/reports` (new-report alert) and the escalation cron digest.
  - Added `POST /api/ussd`: a feature-phone-accessible USSD flow (Africa's Talking webhook
    contract — no internet/app required) letting anyone dial in, report an issue against a water
    point by its code, or check its current status. USSD-submitted reports enter the same
    `PENDING_REVIEW` moderation queue as anonymous web reports (a phone number alone isn't a
    verified account). Pure menu-building/parsing logic lives in `src/lib/ussd.ts` and is unit
    tested (`ussd.test.ts`) independently of the DB-backed route handler.
  - Documented setup (Africa's Talking USSD channel + env vars) in `docs/DEPLOYMENT.md`.
- [x] **Phase 24 — Localization: Luganda for the public reporting flow (roadmap "Phase 3b")**
  - Added a minimal, dependency-free localization layer scoped to the public reporting flow (per
    the roadmap, not a full site-wide i18n framework — no existing i18n library, no routing
    changes): `src/lib/i18n.ts` (English/Luganda string dictionary), `src/components/
    locale-provider.tsx` (a small React Context persisting the choice to `localStorage`, restored
    after mount to avoid an SSR/CSR hydration mismatch).
  - `ReportForm` (the report-an-issue form on every water point detail page) now renders in the
    selected language, with an inline English/Luganda toggle, including issue-type options,
    field labels, and success/error messages.
  - The Luganda text is a good-faith starting translation, explicitly flagged in code comments
    and `docs/DATA-METHODOLOGY.md` as NOT reviewed by a native speaker — a real deployment should
    have it checked before relying on it.
  - Unit tested (`i18n.test.ts`); lint/typecheck/test all pass with no new dependencies added.
- [x] **Phase 25 — Operational hardening (roadmap "Phase 4")**
  - `src/lib/rate-limit.ts` now supports a shared Upstash Redis backend (plain HTTP REST API, no
    client SDK dependency — same pattern as `sendNotification()`/`sendSms()`) when
    `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set, closing the previously-documented
    "in-memory limiter isn't shared across instances" gap. Falls back to the in-memory limiter by
    default and on any Upstash failure (fails open rather than blocking login/reporting). All 5
    call sites (login x2, register, reports, USSD) updated to `await` the now-async function.
  - Added `src/lib/logger.ts`: structured JSON log lines (timestamp/level/message/context) for
    every unhandled API error, replacing a bare `console.error(error)` in `rbac.ts`'s central
    `apiErrorResponse()`. Deliberately does not hand-roll a specific error-tracking vendor's wire
    protocol (e.g. Sentry) — documented in `docs/DEPLOYMENT.md` how to add `@sentry/nextjs` for
    real error tracking, which auto-instruments `console.error` with no further code changes.
  - Added a "Data retention and backups" section to `docs/DEPLOYMENT.md`: Neon PITR window,
    recommended independent periodic backups, retention-policy guidance, and secrets-rotation
    notes (`JWT_SECRET` rotation invalidates all sessions immediately, no grace period).
  - Added a "Uganda's Data Protection and Privacy Act, 2019" section to `docs/PRIVACY.md` and the
    `/privacy` page: named data controller (demo-scale placeholder, explicitly flagged as
    needing replacement by a real deployment), lawful basis, data subject rights, and a
    cross-border storage disclosure (Vercel/Neon may store data outside Uganda).
  - A Terms of Service page already existed (`/terms`) and was reviewed as adequate — no changes
    needed there.
  - Unit tested (`logger.test.ts`, extended `rate-limit.test.ts` covering the Upstash and
    fallback-on-failure paths); lint/typecheck/test all pass with no new dependencies added.

- [x] **Phase 26 — Production incident fix: schema/DB drift on Vercel**
  - The live Vercel deployment started failing its build with a Prisma `P2022` error
    (`Report.moderationStatus` column missing) because the production Neon database had never
    been synced with schema changes added in Phase 21 — `prisma migrate`/`db push` had only ever
    been run against local/CI databases, not the real production one.
  - Fixed by running `prisma db push` directly against the production `DATABASE_URL` to bring the
    live schema in line with `schema.prisma`, and added a "Deploying schema changes" section to
    `docs/DEPLOYMENT.md` documenting that any future schema change must be pushed to production
    before/alongside deploying the code that depends on it.
  - Added `export const dynamic = "force-dynamic"` to `/api/public/insights` and `/api/health` so
    Next.js stops attempting to statically prerender routes that must always hit the live
    database.
  - Investigated a reported "lint error" in `schema.prisma` — confirmed as a false positive (no
    real Prisma validation issue).
- [x] **Phase 27 — Privatized credentials and "production-ready, honest placeholder data" wording pass**
  - Removed all publicly-known demo login credentials. `prisma/seed.ts` now requires
    `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (throws via a new `requireEnv()` helper if unset),
    supports optional `SEED_CARETAKER_EMAIL/PASSWORD/NAME` and `SEED_MEMBER_EMAIL/PASSWORD/NAME`
    for one real caretaker/member login, and gives every other seeded caretaker/member account a
    random, undisclosed password (`randomPassword()`, `crypto.randomBytes`) instead of the old
    shared hardcoded passwords. Documented the new env vars in `.env.example`; added CI-only
    throwaway values to `.github/workflows/ci.yml` so the seed step in CI keeps working.
  - Removed the public "Demo accounts" autofill list from the login page, and the "create a demo
    account" wording from the register page and home page CTA.
  - Reworded the README, `docs/DATA-METHODOLOGY.md`, the in-app `/data-methodology` page, `/about`,
    `/privacy`, `docs/PRIVACY.md`, `/copyright`, the footer, and site-wide SEO metadata
    (`layout.tsx`) away from "fictional demo/portfolio project" framing and toward: the *software*
    is production-ready, while the *public instance's water-point dataset* is honestly disclosed
    as a placeholder demonstration dataset (153 points across real Ugandan towns/cities) pending
    real, verified data. Also fixed several stale figures left over from the Phase 15 reseed
    (README/`/data-methodology` still said "62 fictional water points"/"one small fictional
    community").
  - No schema changes. Verified with `npm run lint`, `npm run typecheck`, `npm run test`, and
    `npm run build`, all passing.
- [x] **Phase 28 — Real water point data: nationwide WPDx import, replacing all placeholder data**
  - Added `prisma/import-real-water-points.ts`: a re-runnable import from the **Water Point Data
    Exchange (WPDx)**, a free, open water-point data aggregator, pulling every Uganda record
    (98,767 raw, 98,722 valid/de-duplicated after excluding a handful of non-fixed "delivered/
    packaged water" entries) via its public API. Ran it against production: deleted the 153
    placeholder (`WP-###`) seed water points (cascading their fictional reports/maintenance logs)
    and inserted 98,722 real water points with real coordinates, technology type, and district/
    sub-county/parish, sourced from Uganda's Ministry of Water and Environment (2009 census) and
    later NGO surveys (Water For People, The Water Trust, IRC, World Vision, YouthMappers, etc.,
    2012\u20132025).
  - Added `VerificationMethod.EXTERNAL_DATASET` (additive enum value, pushed to production) so an
    imported record's provenance is honestly distinct from a field visit, caretaker update, or
    community report.
  - **Honesty policy for imported status**: 79% of Uganda's WPDx records (77,048 of 98,767) come
    from the single 2009 census \u2014 17+ years old. Rather than presenting that census's
    functional/non-functional reading as current fact, any water point whose only status evidence
    predates 2016 is imported as `NEEDS_VERIFICATION` (87,358 of 98,722 landed here); only
    recent (2016+) field reports carry their stated status forward, tagged with the real
    `lastVerifiedAt` report date.
  - `WaterPointsMap` (map.tsx): added MapLibre clustering (`cluster: true` on the GeoJSON source,
    plus cluster-circle and count-label layers, click-to-zoom-into-cluster) \u2014 required for a
    98k-point dataset to render as a readable map instead of a solid mass of overlapping dots.
  - `/map` page: discovered and fixed a real performance problem while testing at this new scale
    \u2014 the page's water-point query had no `take` cap and sorted alphabetically by name,
    fetching and serializing all 98,722 rows on every request (measured: ~17s query time, ~17.8MB
    JSON payload). Replaced with a fast `ORDER BY random() LIMIT 15000` sample (a separate cheap
    `count()` gives the true total for the stat card), and updated the page copy to honestly say
    "a live, nationwide-random sample of N of the M real water points" instead of implying every
    point is always plotted. The full dataset remains completely browsable/searchable via the
    already-paginated `/water-points` list and individual detail pages, which were unaffected.
  - Updated `docs/DATA-METHODOLOGY.md`, the in-app `/data-methodology` page, README, `/about`,
    `/privacy`, `docs/PRIVACY.md`, `/copyright`, and the footer to describe the real WPDx data
    provenance (replacing the Phase 27 "placeholder dataset" language) while keeping the
    fictional, deterministic `db:seed` script as a separate, clearly-labeled dev/CI-only fixture
    (a new `db:import-real-water-points` script is the one that touches real data).
  - Known follow-up (not fixed this phase): `/water-points`' village-filter dropdown queries
    ~1,410 distinct village/parish names in ~5-6s \u2014 usable but not fast; a future pass could
    cache this list or switch to a searchable combobox instead of a plain `<select>`.
  - Verified with `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`, all
    passing, plus a direct production query confirming 98,722 total water points and 0 leftover
    placeholder (`WP-###`) rows.

## Required checks before merging a feature branch into `perez`

- Frontend lint, TypeScript check, unit tests, production build.
- Prisma schema validation.
- Manual verification that no critical flow is broken.

## Required checks before merging `perez` into `main`

All of the above, plus: a `prisma db push` + seed dry run against a disposable database, and a
manual smoke test of the public directory, auth, reporting, caretaker, and admin flows.


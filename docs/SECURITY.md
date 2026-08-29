# Security

## Reporting a vulnerability

Please open a private security advisory on GitHub or contact the repository owner directly. Do
not open a public issue for undisclosed vulnerabilities.

## Authentication

- Passwords are hashed with `bcryptjs` (work factor 12), never stored or logged in plaintext.
- Sessions are `jose`-signed JWTs (`HS256`) stored in an `httpOnly`, `SameSite=Lax` cookie,
  marked `Secure` in production, 7-day expiry.
- `JWT_SECRET` must be a random string of 32+ characters, provided only via environment variables.

## Authorization

- Role-based access control with three roles: `ADMIN`, `CARETAKER`, `MEMBER`.
- `src/middleware.ts` blocks unauthenticated/unauthorized requests to `/dashboard/admin/*`,
  `/dashboard/caretaker/*`, and `/dashboard/member/*` at the Edge, before the page renders.
- Every mutating Route Handler independently re-verifies the role via `requireRole()` — the
  middleware redirect is a UX convenience, never the sole authorization check.
- Caretakers may only act on water points/reports they are assigned to; this is enforced
  server-side on every write, not just in the UI.

## Input validation

Every Route Handler validates its input with a Zod schema (`src/lib/validation.ts`) before
touching the database. Prisma's parameterized queries prevent SQL injection.

## Transport & headers

`next.config.ts` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`
(`geolocation=(self)` so only this site's own origin — the `/map` page — can request the
browser's location; `camera`/`microphone` remain fully disabled),
`Strict-Transport-Security` (2-year max-age, includeSubDomains, preload), and a
`Content-Security-Policy` on every response.

## Health & monitoring

`GET /api/health` runs a trivial `SELECT 1` against the database and returns `503` on failure —
intended for uptime monitors and load-balancer health checks, not a substitute for real
observability (no error-tracking/APM is wired up yet; see Known limitations).

## Third-party services (map & routing)

The live map (`/map`) uses **MapLibre GL JS** with the free **OpenFreeMap** vector-tile style and
the free public **OSRM** demo server for turn-by-turn, road-accurate routing from a user's shared
location to a water point. Neither requires an API key. Browser geolocation itself never leaves
the client except as coordinates sent directly to OSRM to compute a route — no location data is
stored server-side. The page requests a fresh, high-accuracy (GPS-preferred) location as soon as
it loads; the browser's own permission prompt still governs whether this is allowed, and nothing
is requested if the visitor declines.

## Rate limiting

An in-memory limiter (`src/lib/rate-limit.ts`) throttles login, registration, and report
submission per IP.

### Known limitations

- The rate limiter is **per warm serverless instance**, not distributed. Under real multi-instance
  production traffic it blunts casual abuse but is not a substitute for an edge/WAF-level control
  or a shared store (e.g. Upstash Redis) for strict guarantees. Documented here deliberately
  rather than overstating the protection.
- `Content-Security-Policy` allows `'unsafe-inline'` for `script-src`/`style-src` because Next.js
  injects inline hydration data and Tailwind emits inline styles; a stricter nonce-based CSP is a
  reasonable future hardening step.
- No error-tracking/APM (e.g. Sentry) is wired up; server errors are only visible in platform logs.
- `/api/water-points` has a hard `take: 2000` safety cap but no real offset/cursor pagination —
  fine at current (~60 seed points) scale, worth revisiting before a large real-world rollout.
- The OSRM public demo routing server (`router.project-osrm.org`) is explicitly documented by
  its maintainers as light-use/evaluation-only, not a production SLA. At real-world scale this
  should move to a self-hosted OSRM instance or a paid routing provider. OpenFreeMap's tile
  service is intended for production use and has no such caveat.

## Audit logging

Sensitive actions (login, registration, role changes, status changes, report status changes,
maintenance log entries) are recorded in the `AuditLog` table with actor, action, entity, and
metadata — never with secrets.

## Dependency scanning

`npm audit` runs in CI (non-blocking) on every pull request.

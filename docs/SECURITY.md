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
- Sessions carry a `tokenVersion` claim checked against the database on every `requireRole()` call
  and every dashboard page load (`getVerifiedSession()`), so logout and role changes take effect
  immediately instead of waiting for the JWT to expire — see finding 2 below.

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
  fine at current (~150 seed points) scale, worth revisiting before a large real-world rollout.
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

## Security audit findings (2026, deep review)

A focused, code-grounded review of every authentication, session, RBAC, validation, rate-limit,
and API route file. Listed honestly — strengths and remaining gaps both — rather than restating
only the positive claims above.

### Confirmed strengths

- Every mutating/per-ID route (`reports/[id]`, `water-points/[id]`, `admin/users/[id]`,
  `maintenance-logs`) independently re-checks the caller's role **and**, for `CARETAKER`s, that
  they own the specific water point being acted on — verified by reading every route handler, not
  just the shared `requireRole()` helper. There is no route that trusts client-supplied IDs
  without an ownership check.
- The only raw SQL in the codebase is the static, non-interpolated `SELECT 1` in `/api/health`.
  No `$queryRawUnsafe`/string-built SQL exists anywhere — confirmed by a workspace-wide search.
- `.env` is gitignored at both the repo root and inside `frontend/`; only `.env.example` (with
  placeholder values) is committed. No real secret ever appears in the git history that was
  reviewed.
- The public, unauthenticated `/api/public/insights` endpoint deliberately selects only
  non-PII fields (verified against its Prisma `select`) — no reporter identity, email, or
  caretaker name is exposed to anonymous visitors.
- `JWT_SECRET` is validated at runtime to be 32+ characters before it's ever used to sign/verify
  a token, so a misconfigured short secret fails loudly instead of silently weakening sessions.

### Findings / remaining risks

1. **Login user-enumeration timing side channel — fixed.** `POST /api/auth/login` previously
   only ran `bcrypt.compare` when a user with the given email existed, so a request for a
   non-existent email returned almost immediately while a wrong password for a real email took
   the full bcrypt (cost 12) comparison time — a patient attacker could statistically distinguish
   registered emails from unregistered ones. Fixed: the route now always runs a bcrypt comparison
   (against a fixed dummy hash, `DUMMY_PASSWORD_HASH` in `src/lib/password.ts`, when no user is
   found) so both branches take comparable time.
2. **No server-side session revocation — fixed.** Sessions were stateless 7-day JWTs with no
   allow/deny list: logout only deleted the client's cookie, so a copied/leaked token stayed
   valid for the rest of its 7-day life, and a role change didn't take effect until the user's
   token naturally expired. Fixed: `User` now has a `tokenVersion` counter, embedded in every
   signed JWT. `requireRole()` (used by every mutating route) and the new `getVerifiedSession()`
   (used by every dashboard page's own server-side role check) both look up the live
   `tokenVersion` in the database on each request and reject the session if it doesn't match —
   logout and admin role changes both increment it, so a leaked/copied token or a demoted user's
   old token is rejected immediately, not just once it expires.
3. **CSV export formula-injection risk — fixed.** Cells in `/api/analytics/export` were
   comma/quote-escaped but not neutralized against leading `=`, `+`, `-`, or `@` characters, which
   Excel/Sheets treat as the start of a formula. The exported `caretaker` column is sourced from a
   user's self-chosen registration `name` field (only length-validated, no character
   restriction), so a caretaker could pick a name that becomes an executable formula when an
   admin opens the export in a spreadsheet app. Fixed: `toCsvRow()` now prefixes a leading `'`
   on any cell value starting with one of those characters, forcing spreadsheet apps to treat it
   as plain text.
4. **Rate limiting was IP-only, not account-aware — fixed.** 10 login attempts / 15 min per IP
   (already documented as non-distributed across serverless instances) didn't stop a distributed
   credential-stuffing attempt against one specific account from many IPs. Fixed: `POST
   /api/auth/login` now also enforces a second limit keyed by the normalized email address, so an
   attacker spreading login attempts against one account across many IPs is still throttled.
5. **`deepmerge-ts` high-severity advisory** (via `@prisma/config` → `prisma` CLI, confirmed still
   present via `npm audit`) remains unresolved. It is a CLI/dev-time-only dependency — not bundled
   into deployed serverless functions — so it is not exploitable in the running production app.
   The fix requires a semver-major Prisma upgrade and has been deliberately deferred; flagged here
   so it isn't mistaken for an oversight.
6. **Minor: role-update route returned a generic 500 instead of 404 — fixed.** Given a
   non-existent user id, `prisma.user.update` threw `P2025`, caught by the generic error handler
   and reported as a 500. Fixed: the route now checks for the user's existence first and returns
   a clean 404 ("User not found") instead.
7. **Demo credentials are intentionally public** (by design, already documented above) — correct
   for a portfolio demo, but a reminder that this exact pattern (public admin password in seed
   data) must never be reused as-is for a real deployment with real user data.

None of the above were exploited or demonstrated against the live deployment; they are static
code-review findings. Items 1, 2, 3, 4, and 6 have been fixed as part of this review; item 5 is
already-mitigated (not runtime-reachable, requires a semver-major upgrade to resolve cleanly) and
item 7 is an intentional design choice for a public portfolio demo — neither requires further
action.


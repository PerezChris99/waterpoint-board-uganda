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
- `src/middleware.ts` blocks unauthenticated/unauthorized requests to `/dashboard/admin/*` and
  `/dashboard/caretaker/*` at the Edge, before the page renders.
- Every mutating Route Handler independently re-verifies the role via `requireRole()` — the
  middleware redirect is a UX convenience, never the sole authorization check.
- Caretakers may only act on water points/reports they are assigned to; this is enforced
  server-side on every write, not just in the UI.

## Input validation

Every Route Handler validates its input with a Zod schema (`src/lib/validation.ts`) before
touching the database. Prisma's parameterized queries prevent SQL injection.

## Transport & headers

`next.config.ts` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and a
`Content-Security-Policy` on every response.

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

## Audit logging

Sensitive actions (login, registration, role changes, status changes, report status changes,
maintenance log entries) are recorded in the `AuditLog` table with actor, action, entity, and
metadata — never with secrets.

## Dependency scanning

`npm audit` runs in CI (non-blocking) on every pull request.

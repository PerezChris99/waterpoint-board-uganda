# Architecture

## Overview

WaterPoint Board Uganda is a single full-stack **Next.js** application — there is no separate
backend service to deploy. This was a deliberate simplification (see
[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)) so the whole platform can be hosted on Vercel with a
single deploy and a serverless Postgres database.

```
Next.js App Router (React Server Components + Route Handlers)
        |
        |-- Server Components / Server Actions  -> Prisma ORM
        |-- Route Handlers (/api/**)             -> Prisma ORM
        |-- middleware.ts (Edge)                 -> JWT session verification
        v
Prisma ORM
        v
PostgreSQL (Neon serverless, production) / any Postgres (local dev)
```

## Why Next.js-only (not a separate Flask/Express API)

Earlier drafts of this project used a separate Flask API. It was retired in favor of Next.js
Route Handlers so that:

- There is exactly **one** service to deploy (Vercel), with no second host, no CORS
  configuration, and no cross-service network calls in the request path.
- The database is the only external dependency, and Neon's free tier + Vercel's native Postgres
  integration make that a two-minute setup.
- TypeScript types are shared end-to-end (Prisma-generated types flow directly into Server
  Components, Route Handlers, and client components) with zero duplication of DTOs.

## Application layers

- **`src/app/`** — routes (public pages, `/dashboard/*` role-gated pages, `/api/**` Route
  Handlers), following the Next.js App Router file-system convention.
- **`src/components/`** — shared React components (nav, footer, forms, charts).
- **`src/lib/`** — framework-agnostic logic:
  - `db.ts` — singleton Prisma client.
  - `password.ts` — bcrypt hashing (Node runtime only).
  - `jwt.ts` — Edge-safe JWT sign/verify (`jose`), used by both Route Handlers and `middleware.ts`.
  - `session.ts` — cookie-based session helpers for Server Components/Route Handlers.
  - `validation.ts` — Zod schemas shared by every Route Handler.
  - `rbac.ts` — `requireRole()` guard + a consistent API error shape.
  - `rate-limit.ts` — in-memory rate limiting for auth/report endpoints.
  - `audit.ts` — audit log writer for sensitive actions.
  - `labels.ts` — enum → human-readable label/tone mappings shared by UI and CSV export.
- **`prisma/schema.prisma`** — the single source of truth for the data model.
- **`prisma/seed.ts`** — deterministic seed script (see [DATA-METHODOLOGY.md](DATA-METHODOLOGY.md)).
- **`src/middleware.ts`** — Edge middleware protecting `/dashboard/admin/*` and
  `/dashboard/caretaker/*` by role, redirecting unauthenticated/unauthorized requests.

## Data model

`User` (roles: `ADMIN`, `CARETAKER`, `MEMBER`) · `WaterPoint` (fixed seed list, one caretaker each)
· `Report` (community-submitted issues) · `MaintenanceLog` (caretaker activity history) ·
`AuditLog` (sensitive-action trail). See `prisma/schema.prisma` for the full schema with enums,
indexes, and relations.

## Authentication & authorization

- Custom credentials auth: `bcryptjs` password hashing, `jose`-signed JWT stored in an
  `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie.
- `middleware.ts` runs on the Edge runtime and redirects unauthenticated/unauthorized requests
  before a protected page ever renders.
- Every mutating Route Handler re-checks the role server-side via `requireRole()` — the
  middleware is a UX convenience, not the only authorization boundary.

## Error contract

Every API error response follows:

```json
{ "error": { "message": "Human-readable message", "fields": {} } }
```

The API never returns stack traces, SQL errors, password hashes, or other sensitive internals.

## Infrastructure

- **Hosting:** Vercel (Next.js, zero extra config).
- **Database:** Neon serverless Postgres (or any Postgres for local dev).
- **CI:** GitHub Actions — lint, typecheck, unit tests, production build, and a Postgres-service-
  backed integration check (`prisma db push` + seed) on every PR into `perez`/`main`.

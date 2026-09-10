# Deployment

## Target: Vercel + Neon (recommended, "easy" path)

The whole app is one Next.js project — one Vercel project, one database, no second service.

### 1. Create a Postgres database

1. Create a free [Neon](https://neon.tech) project (or use Vercel's own "Storage → Postgres"
   integration, which provisions Neon under the hood).
2. Copy the pooled connection string — this is your `DATABASE_URL`.

### 2. Create the Vercel project

1. Import the GitHub repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add environment variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — from step 1.
   - `JWT_SECRET` — a random 32+ character string (`openssl rand -base64 32`).
   - `NEXT_PUBLIC_SITE_URL` — `https://waterpointboarduganda.vercel.app`.
4. Set the production domain alias to `waterpointboarduganda.vercel.app` (Project Settings →
   Domains).

### 3. Initialize the database schema and seed data

Run once, locally, pointed at the production `DATABASE_URL` (or via `vercel env pull` +
local run):

```bash
cd frontend
npm install
npx prisma db push
npm run db:seed
```

This creates all tables and loads the fixed, deterministic demo dataset (see
[DATA-METHODOLOGY.md](DATA-METHODOLOGY.md)). The seed script is idempotent — re-running it always
resets to the same 153 water points, 24 users, and historical reports/maintenance logs.

### 4. Deploy

Push to `main` (or click "Deploy" in the Vercel dashboard). Vercel builds with `next build`;
`postinstall` runs `prisma generate` automatically so the Prisma Client matches the schema.

### 5. Verify

- `https://waterpointboarduganda.vercel.app/` loads the landing page.
- `https://waterpointboarduganda.vercel.app/water-points` lists seeded water points.
- Log in with a demo account (see [DATA-METHODOLOGY.md](DATA-METHODOLOGY.md)) and confirm the
  caretaker/admin dashboards load.

## Local development

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in a local/dev DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Any reachable Postgres works for local dev (a free Neon branch, a local Postgres install, or a
teammate's shared dev database) — Docker is not required.

## Environment variables

See `frontend/.env.example` for the full list. Never commit real `.env`/`.env.local` files.

## Escalation notifications (optional)

Reports left `OPEN`/`ACKNOWLEDGED` for more than 14 days are considered "escalated" (see
`src/lib/escalation.ts`) — this is computed on read, no scheduled job is required for the app
itself to work. To also get a daily email digest sent to affected caretakers:

1. Set `RESEND_API_KEY` (and optionally `NOTIFICATIONS_FROM_EMAIL`) so `sendNotification()`
   (`src/lib/notifications.ts`) sends real emails via [Resend](https://resend.com) instead of
   just logging. With no key set, this is a safe no-op — nothing breaks, nothing sends.
2. Set `CRON_SECRET` to a random secret. `GET /api/cron/escalations` requires
   `Authorization: Bearer <CRON_SECRET>` and returns 401 for anything else, including when the
   variable is unset.
3. The Vercel Cron schedule is already configured in `frontend/vercel.json`:
   ```json
   {
     "crons": [{ "path": "/api/cron/escalations", "schedule": "0 6 * * *" }]
   }
   ```
   Vercel automatically sends the correct `Authorization` header for cron-triggered requests when
   `CRON_SECRET` is set as a project environment variable — no extra wiring needed. Check your
   current Vercel plan's cron limits (frequency, invocation count) in the Vercel dashboard; the
   route itself still works fine if triggered manually/by another scheduler with the right secret.

New report submissions also try to notify the assigned caretaker immediately via the same
`sendNotification()` path (best-effort — a failed/unconfigured notification never blocks the
report itself from being saved).

## SMS + USSD (optional)

Not every caretaker has reliable internet access; SMS and USSD (feature-phone menus, no app or
data connection required) are how most rural water-point workflows in Uganda actually operate
today — see `docs/NWSC-PRODUCTION-STRATEGY.md`.

- Set `AFRICAS_TALKING_API_KEY` and `AFRICAS_TALKING_USERNAME` (and optionally
  `AFRICAS_TALKING_SENDER_ID`) so `sendSms()` (`src/lib/sms.ts`) sends real texts via
  [Africa's Talking](https://africastalking.com) instead of just logging. New reports and the
  escalation digest both text the assigned caretaker if their account has a `phone` on file, in
  addition to email.
- `POST /api/ussd` implements Africa's Talking's USSD webhook contract: dial in, choose "1" to
  report an issue or "2" to check a water point's status by its code (e.g. `WP-001`), no
  internet/app required. To wire it up, create a USSD service in the Africa's Talking dashboard
  and set its callback URL to `https://<your-domain>/api/ussd`. Reports submitted via USSD enter
  the same `PENDING_REVIEW` moderation queue as anonymous web reports, since a phone number alone
  isn't a verified account.

## Shared rate limiting (optional)

By default, rate limiting (`src/lib/rate-limit.ts`) is in-memory and scoped to a single warm
serverless instance — good enough to blunt casual abuse, but not shared across instances under
real multi-instance production traffic. Set `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` (from an [Upstash](https://upstash.com) Redis database's REST API
credentials) to switch to a shared, cross-instance limiter automatically — no code changes needed,
and it fails open to the in-memory limiter if Upstash is temporarily unreachable.

## Structured logging / error tracking (optional)

`src/lib/logger.ts` emits structured JSON log lines (timestamp, level, message, context) for every
unhandled API error, which Vercel captures from stdout/stderr automatically. To add a real error
tracker (recommended for production): install `@sentry/nextjs` and follow its
[Next.js setup guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/) — once
configured, Sentry auto-instruments `console.error`, so every `logger.error()` call is picked up
without further code changes.

## Data retention and backups

- **Neon Postgres:** Neon retains automatic point-in-time-recovery (PITR) history for a window
  determined by your plan (check the current retention window in the Neon dashboard before
  relying on it). For a real deployment, additionally schedule your own periodic `pg_dump` exports
  (e.g. a daily GitHub Actions/cron job) stored somewhere independent of Neon, and document a
  restore procedure and who is responsible for testing it periodically.
- **Retention policy:** this project has no automatic data-deletion job. Audit logs, resolved
  reports, and maintenance history currently accumulate indefinitely. A real deployment handling
  real personal data should decide and document a retention period (e.g. "delete resolved reports
  older than N years") consistent with its data protection obligations (see
  [PRIVACY.md](PRIVACY.md)) and implement it as an explicit, reviewed job — not a default of this
  codebase.
- **Secrets rotation:** `JWT_SECRET` rotation invalidates every existing session (users must log
  in again) — there is no dual-secret grace period. Plan rotations accordingly.

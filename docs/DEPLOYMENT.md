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
resets to the same ~62 water points, 24 users, and historical reports/maintenance logs.

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

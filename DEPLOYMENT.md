# Deployment

## Environments

- **Local:** Docker Compose (`docker compose up --build`).
- **Staging/Production (planned):** Frontend on Vercel or Netlify; Flask backend on Railway or Render; PostgreSQL via Railway or Supabase.

## Environment variables

Copy each `.env.example` to the corresponding real file (`.env`, `.env.local`) and fill in real values. Never commit real secrets.

## Backend release steps (once deployed)

1. Run `flask db upgrade` against the target database.
2. Start with Gunicorn: `gunicorn --bind 0.0.0.0:5000 run:app`.
3. Confirm `GET /api/v1/health` returns `200`.

## Frontend release steps (once deployed)

1. `npm run build`
2. `npm run start` (or deploy the build output to the hosting platform).

Full deployment automation and staging smoke tests are added in Phase 11.

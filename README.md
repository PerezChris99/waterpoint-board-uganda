# WaterPoint Board Uganda

A localized community platform for viewing and maintaining information about shared water points in one small Ugandan community.

> **Scope note:** This is a modest local community utility, not a national water-management system, a government replacement, a drinking-water certification platform, or a contamination-detection tool. Demo data is fictional and does not represent verified official information.

> WaterPoint Board displays community-reported operational information. Statuses may change and should be verified locally. This platform does not certify water quality or drinking-water safety.

## Status

Phase 0 — repository, frontend, and backend foundations. Later phases (public directory, authentication, reporting, caretaker tools, admin tools, analytics, security hardening, SEO/accessibility, release) are tracked in [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## Project structure

```
waterpoint-board-uganda/
├── frontend/          Next.js + TypeScript + Tailwind CSS
├── backend/           Flask + SQLAlchemy + PostgreSQL API
├── docs/              Development plan and supporting docs
├── docker-compose.yml Local development stack (frontend, backend, postgres)
└── .github/workflows/ CI pipeline
```

## Technology stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Leaflet, Recharts, Framer Motion, Vitest, React Testing Library, Playwright, axe-core.

**Backend:** Flask, Flask Blueprints, SQLAlchemy, Flask-Migrate, PostgreSQL, Marshmallow, Pytest, Gunicorn.

**Infrastructure:** Docker Compose, GitHub Actions CI.

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16 (or Docker)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate   # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements-dev.txt
cp .env.example .env
flask db upgrade
python run.py
```

### Full stack with Docker Compose

```bash
docker compose up --build
```

## Environment variables

See `frontend/.env.example` and `backend/.env.example` for the full list of required variables. Never commit real `.env` files.

## Test commands

```bash
# Frontend
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build

# Backend
cd backend
ruff check .
bandit -r app -ll
pytest -q
```

## Security overview

See [SECURITY.md](SECURITY.md) for the full security model (authentication, authorization, upload handling, rate limiting, and reporting a vulnerability).

## Data limitations

See [DATA-METHODOLOGY.md](DATA-METHODOLOGY.md) for how status and freshness are calculated, and what this platform does and does not claim.

## Git workflow

Branch flow: `feature/*` → `perez` → `main`. `main` is the production/default branch; `perez` is the integration branch. Never push directly to `main`. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Future improvements

Public directory with map/list split view, authentication and roles, community reporting, caretaker and admin tools, descriptive analytics, security hardening, SEO/accessibility passes, and release preparation — see [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

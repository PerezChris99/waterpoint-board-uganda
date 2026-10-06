# WaterPoint Board Uganda

**A full-stack community water-point tracking platform** — built with Next.js, TypeScript,
Prisma, and PostgreSQL, deployed on Vercel.

[![CI](https://github.com/PerezChris99/waterpoint-board-uganda/actions/workflows/ci.yml/badge.svg)](https://github.com/PerezChris99/waterpoint-board-uganda/actions/workflows/ci.yml)
[![Live instance](https://img.shields.io/badge/live-waterpointboarduganda.vercel.app-2f7ec2)](https://waterpointboarduganda.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-black)](LICENSE)

**Live instance:** [waterpointboarduganda.vercel.app](https://waterpointboarduganda.vercel.app)

> **Scope note:** This project is engineered as a national-scale community water-point transparency and
> reporting platform for rural/peri-urban Uganda, positioned to complement (never replace)
> National Water and Sewerage Corporation (NWSC) billing/network operations and the Ministry of
> Water and Environment's water-point data collection. It is **not** a drinking-water
> certification platform, a contamination-detection tool, or an official government system. The
> publicly hosted instance's ~98,700 water points are real, imported from the open Water Point Data Exchange. The software is designed for national-scale use, but the public demo is not itself an official government service and does not claim government certification, an availability SLA, completed disaster-recovery testing, or institutional approval. A real national deployment requires the infrastructure, security assessment, data-governance, identity, backup, operational, and field-validation controls documented in [docs/NWSC-PRODUCTION-STRATEGY.md](docs/NWSC-PRODUCTION-STRATEGY.md) and [docs/OPERATIONS.md](docs/OPERATIONS.md). See also [docs/DATA-METHODOLOGY.md](docs/DATA-METHODOLOGY.md).

---

## What it does

WaterPoint Board Uganda tracks the operational status of community water points — boreholes,
shallow wells, protected springs, tap stands, and rainwater tanks — spread across real Ugandan
towns and cities nationwide. It models a realistic end-to-end workflow:

- **Anyone** can browse the public directory and search/filter water points by status, type, or
  village.
- **Community members** can report issues (no water, contamination concerns, physical damage,
  vandalism) against any water point, with or without an account.
- **Caretakers** get a dashboard of their assigned water points, triage open reports, update
  status, and log maintenance history.
- **Admins** manage user roles, review a full audit trail, and view analytics dashboards with a
  one-click CSV export.

## Feature highlights

| Area | What's implemented |
| --- | --- |
| 🗺️ Public directory | Search + filter by status/type/village, freshness indicators, full report & maintenance history per water point |
| 📝 Community reporting | Anonymous or authenticated issue reporting, rate-limited, validated with Zod |
| 🧰 Caretaker tools | Per-caretaker dashboard, status updates, maintenance logging |
| 🛠️ Admin tools | Role management, audit/activity feed, CSV export |
| 📊 Analytics | Status/issue/village breakdowns with Recharts |
| 🔐 Auth & RBAC | Custom credentials auth (bcrypt + signed JWT cookie), Edge middleware route protection, server-side re-checks on every mutation |
| 🛡️ Security | CSP + security headers, input validation on every endpoint, per-IP rate limiting, audit logging |
| ♿ Accessibility | Skip-to-content link, semantic HTML/ARIA labeling, reduced-motion support, keyboard-navigable forms |
| 🔎 SEO | Metadata API, sitemap/robots, OpenGraph & Twitter cards |
| � Real water data | ~98,700 real Uganda water points imported from the open Water Point Data Exchange (WPDx), with honest status handling for older field reports |
| 🌱 Dev/test seed data | 153 fictional water points, 24 users, hundreds of reports/maintenance logs for local dev and CI — deterministic and idempotent, never run against the live deployment |

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, React Server Components, Route Handlers) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, CSS-variable design tokens |
| Database / ORM | PostgreSQL ([Neon](https://neon.tech) serverless) + [Prisma](https://www.prisma.io) |
| Auth | Custom — `bcryptjs` + `jose` (JWT), `httpOnly` cookies, Edge middleware |
| Validation | [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) |
| Testing | Vitest, React Testing Library, jest-axe |
| CI/CD | GitHub Actions → Vercel |

## Architecture

```
Next.js App Router (Server Components + Route Handlers)
        |
        |-- middleware.ts (Edge)  ->  JWT session verification, role-gated redirects
        |-- Route Handlers (/api/**) -> Zod validation -> Prisma -> Postgres
        v
Prisma ORM  ->  PostgreSQL (Neon serverless)
```

One deployable service, one database — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the
full breakdown and the reasoning behind retiring an earlier separate-backend design.

## Project structure

```
waterpoint-board-uganda/
├── frontend/                 Next.js app (the entire product)
│   ├── prisma/                schema.prisma + deterministic seed.ts
│   └── src/
│       ├── app/                routes: public pages, /dashboard/*, /api/**
│       ├── components/         shared UI (nav, forms, charts)
│       ├── lib/                db, auth, validation, rbac, rate-limit, audit
│       └── middleware.ts       Edge route protection
├── .github/                  CI, security scanning, ownership and dependency automation
├── docs/                      Architecture, API, security, deployment, data methodology, etc.
└── .github/workflows/ci.yml   Lint, typecheck, test, build
```

## Getting started

### Prerequisites

- Node.js 24
- A reachable PostgreSQL database

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, JWT_SECRET and a real operator email/password:
# SEED_ADMIN_EMAIL=your-real-email
# SEED_ADMIN_PASSWORD=a-private-password-of-16+-characters
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

The seed is **not a demo-data generator**. It retrieves real Uganda water-point records from the Water Point Data Exchange (WPDx), validates coordinates and administrative fields, preserves source identifiers, and marks old functionality observations as NEEDS_VERIFICATION. It creates no fictional water points, coordinates, phone numbers, organisations, reports, or maintenance events. The only account it can create is the real operator account supplied through SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD.

For the authoritative national operational baseline, reconcile WPDx records with the Ministry of Water and Environment's WEMIS/WASMIS records and the responsible District Water Officers before commissioning the system nationally. See [docs/DATA-METHODOLOGY.md](docs/DATA-METHODOLOGY.md).

## Test commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Deployment

Deployed on Vercel with a Neon Postgres database. Production uses versioned Prisma migrations, distributed rate limiting, security scanning, and controlled release gates — see
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full step-by-step guide (env vars, schema push,
seeding, and verification).

## Documentation

| Doc | Contents |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, request flow |
| [docs/API.md](docs/API.md) | Full Route Handler reference |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, authorization, validation, rate limiting, known limitations |
| [docs/PRIVACY.md](docs/PRIVACY.md) | What data is collected and why |
| [docs/DATA-METHODOLOGY.md](docs/DATA-METHODOLOGY.md) | Real water point data provenance, dev/test seed data, what this platform does *not* do |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + Neon deployment guide |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branch workflow, PR checklist |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Nationwide operations, recovery, governance and honesty policy |
| [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) | Phase-by-phase build log |
| [docs/DESIGN_BLUEPRINT.md](docs/DESIGN_BLUEPRINT.md) | Design/implementation standard followed for all UI work |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Notable changes |

## Git workflow

`feature/*` → `perez` (integration) → `main` (production). `main` is the default/production
branch; never push directly to `main` or `perez` — see
[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).


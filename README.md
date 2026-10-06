# WaterPoint Board Uganda

**National-scale water infrastructure monitoring, reporting and operational visibility for Uganda.**

WaterPoint Board Uganda is a full-stack platform for making community water-point information easier to discover, report on, verify, maintain and govern. It connects public water-point visibility with operational workflows for caretakers, district-level personnel and administrators.

> **Production and scope statement**
>
> The software is engineered for national-scale use, but the repository and public deployment must not be confused with an officially commissioned Government of Uganda system. The platform does not certify drinking-water quality, detect contamination, replace Ministry of Water and Environment systems, or replace NWSC network/billing operations. A nationwide service requires institutional authorization, authoritative data reconciliation, field verification, production infrastructure, security assessment, backup/DR controls, monitoring and formal operational ownership.
>
> Water-point records imported from the Water Point Data Exchange (WPDx) are real source records, not invented demo data. Source provenance and observation age are preserved, and older or uncertain functionality observations are treated as **NEEDS_VERIFICATION** rather than presented as current field truth. See [docs/DATA-METHODOLOGY.md](docs/DATA-METHODOLOGY.md).

---

## Platform at a glance

| Capability | Status |
| --- | --- |
| Public water-point directory, search and filtering | Implemented |
| Water-point detail, status and history | Implemented |
| Community issue reporting | Implemented |
| Caretaker assignment, triage and maintenance workflows | Implemented |
| Role-based administration | Implemented |
| Audit logging and provenance | Implemented |
| Analytics and CSV export | Implemented |
| Authentication, MFA and authorization controls | Implemented |
| API validation, pagination and distributed rate limiting | Implemented |
| Security headers, CSP and automated security scanning | Implemented |
| WPDx Uganda real-data import/seed | Implemented |
| Production health/readiness verification | Implemented |
| k6 national-scale load-test harness | Implemented |
| Automated email/SMS delivery | Provider-dependent |
| Production monitoring/alerting | Infrastructure-dependent |
| PITR, independent backups and tested disaster recovery | Infrastructure-dependent |
| MWE/WEMIS/WASMIS institutional reconciliation | Requires authorized operational access |
| Formal nationwide commissioning/SLA | Not claimed |

## Core operating model

The platform is designed around a simple operational loop:

**Discover → Report → Triage → Maintain → Verify → Monitor**

- **Citizens/community members** discover a water point and report an observed problem.
- **Caretakers/district personnel** receive and triage reports, update operational status and record maintenance.
- **Administrators** oversee users, audit history, analytics and operational visibility.
- **Verification authorities** can reconcile platform records against authoritative field/institutional sources before information is treated as current official data.

---

## System flows

### 1. Water-point lifecycle

~~~mermaid
flowchart LR
    A[WPDx / authorized source records] --> B[Import + validation]
    B --> C[Water-point record]
    C --> D[Public discovery]
    D --> E[Community observation]
    E --> F[Issue report]
    F --> G[Triage]
    G --> H[Maintenance / corrective action]
    H --> I[Status update]
    I --> J[Verification]
    J --> C
    C --> K[Analytics + operational visibility]
~~~

### 2. Community reporting flow

~~~mermaid
flowchart TD
    A[Community member] --> B[Select water point]
    B --> C[Submit issue]
    C --> D[Request validation]
    D --> E{Valid?}
    E -- No --> F[Return validation error]
    E -- Yes --> G[Create report]
    G --> H[Audit event]
    G --> I[Assigned caretaker / operational queue]
    I --> J[Triage]
    J --> K{Action required?}
    K -- No --> L[Resolve / close]
    K -- Yes --> M[Maintenance]
    M --> N[Update status + maintenance history]
    N --> O[Verification / follow-up]
    O --> L
~~~

### 3. Authenticated request flow

~~~mermaid
sequenceDiagram
    participant U as User
    participant M as Middleware
    participant R as Next.js Route Handler
    participant V as Validation/RBAC
    participant P as Prisma
    participant DB as PostgreSQL
    participant A as Audit Log

    U->>M: HTTPS request
    M->>M: Rate-limit + session check
    M->>R: Authorized request
    R->>V: Validate input + permissions
    V-->>R: Approved
    R->>P: Query / mutation
    P->>DB: SQL
    DB-->>P: Result
    R->>A: Record privileged/security event
    R-->>U: JSON response
~~~

### 4. Production release flow

~~~mermaid
flowchart LR
    A[Feature / fix / security change] --> B[perez integration branch]
    B --> C[CI + lint + typecheck + tests + build]
    C --> D[Security scans]
    D --> E[Pull Request]
    E --> F[main]
    F --> G[Production deployment]
    G --> H[Health / smoke verification]
    H --> I[Monitor + rollback if required]
~~~

The repository's intended release path is:

**feature/fix/security/chore/perf/refactor → perez → main → production**

Direct pushes to 'main' are not part of the normal release process.

---

## Key features

### Public water-point intelligence
- Search and filter water points by operational status, type, district and village.
- Water-point detail pages with status, freshness and available history.
- Geographic/map presentation.
- Real source identifiers and provenance for imported records.
- Conservative status handling when source observations are old or uncertain.

### Community reporting
- Anonymous or authenticated issue reporting.
- Input validation with Zod.
- Rate limiting.
- Supported operational issue categories such as service failure, physical damage and vandalism.
- Reports feed the caretaker/operational workflow.

### Caretaker and operational workflows
- Assigned water-point visibility.
- Report triage.
- Status updates.
- Maintenance history.
- Escalation logic for unresolved reports.
- Optional email/SMS notification integrations when providers are configured.

### Administration and governance
- Role-based access control.
- MFA support for privileged access.
- Audit/activity logging.
- Analytics and CSV export.
- User and operational administration.
- Security-sensitive mutations are re-authorized server-side rather than relying only on UI restrictions.

### Security and reliability
- Signed JWT session cookies with secure/httpOnly controls.
- Password hashing with bcrypt.
- MFA/TOTP support.
- CSP and security headers.
- Zod validation.
- Distributed API/auth rate limiting.
- Audit logging with integrity protections.
- Pagination and bounded API queries.
- Automated CI, CodeQL, OSV and secret scanning.
- Production health/readiness endpoint.
- Versioned Prisma migration workflow.

---

## Data provenance and integrity

The production-safe seed path does **not** manufacture realistic-looking national data.

Water-point records are imported from **Water Point Data Exchange (WPDx) Uganda records**, with:
- source WPDx identifiers retained;
- source coordinates validated against Uganda geographic bounds;
- source administrative fields preserved;
- source observation dates retained;
- old observations conservatively marked **NEEDS_VERIFICATION**;
- provenance recorded through the platform's verification metadata.

The seed requires a real operator email/password through environment variables and does not embed demo credentials or fabricate users, organizations, phone numbers, reports, maintenance events or coordinates.

For national commissioning, WPDx should be reconciled against the authoritative Ministry of Water and Environment systems and District Water Officer records. This repository does not claim that an external dataset is automatically equivalent to current field truth.

---

## Architecture

~~~text
                         ┌─────────────────────────┐
                         │       Web Browser        │
                         │ Public + Authenticated UI│
                         └────────────┬────────────┘
                                      │ HTTPS
                                      ▼
                         ┌─────────────────────────┐
                         │       Next.js 16        │
                         │ App Router + Route APIs │
                         └────────────┬────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                  ┌──────▼──────┐          ┌──────▼──────┐
                  │ Middleware  │          │ Route       │
                  │ Auth/RBAC   │          │ Handlers    │
                  │ Rate Limit  │          │ Validation  │
                  └─────────────┘          └──────┬──────┘
                                                   │
                                            ┌──────▼──────┐
                                            │   Prisma    │
                                            │     ORM     │
                                            └──────┬──────┘
                                                   │
                                            ┌──────▼──────┐
                                            │ PostgreSQL  │
                                            │   Database  │
                                            └─────────────┘

External integrations:
WPDx → real-data import
Upstash → distributed rate limiting
Email/SMS providers → optional notifications
Vercel → deployment/runtime
~~~

### Technology stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16, App Router |
| Language | TypeScript, strict mode |
| UI | React + Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | bcryptjs + jose/JWT + httpOnly cookies |
| MFA | TOTP |
| Validation | Zod |
| Charts | Recharts |
| Maps | MapLibre |
| Rate limiting | Upstash-compatible Redis REST store |
| Testing | Vitest, React Testing Library, jest-axe |
| Load testing | k6 |
| CI/CD | GitHub Actions + Vercel |
| Security scanning | CodeQL, OSV, secret scanning |

---

## Repository structure

~~~text
waterpoint-board-uganda/
├── frontend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── app/              # Pages, dashboards and API routes
│   │   ├── components/       # Shared UI components
│   │   ├── lib/              # Auth, DB, RBAC, validation, audit, etc.
│   │   └── middleware.ts     # Request protection
│   ├── vercel.json            # Production cron configuration
│   └── package.json
├── tests/
│   └── load/                 # k6 performance/load tests
├── scripts/
│   └── verify-production.mjs # Production health verification
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── DATA-METHODOLOGY.md
│   ├── DEPLOYMENT.md
│   ├── OPERATIONS.md
│   └── ...
└── .github/
    └── workflows/            # CI and security automation
~~~

---

## Local development

### Requirements

- Node.js 24.x
- PostgreSQL
- npm

### Setup

~~~bash
cd frontend
npm install
cp .env.example .env.local
~~~

Configure the required environment variables, including a development database, JWT secret and private seed operator credentials.

Then:

~~~bash
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
~~~

The seed is **real-data-only** for water-point records. It retrieves WPDx Uganda data and validates it before insertion. Do not point a development seed operation at production unless you understand the reset controls and operational consequences.

See [docs/DATA-METHODOLOGY.md](docs/DATA-METHODOLOGY.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Testing and quality gates

~~~bash
cd frontend

npm run lint
npm run typecheck
npm run test
npm run build
~~~

Production health verification:

~~~bash
PRODUCTION_URL=https://your-production-domain.example.com npm run test:production
~~~

Load testing:

~~~bash
BASE_URL=https://your-production-domain.example.com k6 run ../tests/load/waterpoint-api.js
~~~

The load test is deliberately separate from normal CI because performance testing must target an explicitly selected environment.

---

## Production readiness boundary

The application codebase contains the controls required for a strong production baseline, but **software readiness is not the same thing as nationwide commissioning**.

Still requiring real operational/infrastructure evidence:

- Production PostgreSQL instance and capacity configuration.
- Point-in-time recovery and independent encrypted backups.
- Tested database restore and disaster-recovery environment/procedure.
- Production monitoring and alerting.
- Production domain/DNS/TLS configuration.
- Production notification provider and delivery monitoring where required.
- Deployment/account capacity sufficient for the intended traffic profile.
- Formal load/stress results against the actual production infrastructure.
- Independent security/penetration assessment.
- Authoritative MWE/WEMIS/WASMIS reconciliation.
- District Water Officer field-validation process.
- National data ownership, retention, correction and access governance.
- Formal RTO/RPO/SLA acceptance and operational ownership.

These are intentionally not represented as completed merely because the corresponding application code exists.

---

## Documentation

| Document | Purpose |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System architecture and data model |
| [API](docs/API.md) | API/Route Handler reference |
| [Security](docs/SECURITY.md) | Authentication, authorization and security controls |
| [Privacy](docs/PRIVACY.md) | Data collection and privacy considerations |
| [Data Methodology](docs/DATA-METHODOLOGY.md) | Data provenance, verification and seed policy |
| [Deployment](docs/DEPLOYMENT.md) | Deployment, environment and migration procedures |
| [Operations](docs/OPERATIONS.md) | Recovery, monitoring, governance and operational runbook |
| [Contributing](docs/CONTRIBUTING.md) | Development and release workflow |
| [Development Plan](docs/DEVELOPMENT_PLAN.md) | Project implementation plan |
| [Design Blueprint](docs/DESIGN_BLUEPRINT.md) | UI/design implementation standards |
| [Changelog](docs/CHANGELOG.md) | Notable project changes |

---

## Release and contribution workflow

~~~text
feature/fix/security/chore/perf/refactor
                    │
                    ▼
                 perez
                    │
              Pull Request
                    │
                    ▼
                  main
                    │
                    ▼
              Production
~~~

'main' is the default/production branch. Changes should reach it through the pull-request workflow and required automated checks.

---

## License and copyright

This project is licensed under the **MIT License**.

**Copyright © 2026 PerezChris99.**

See [LICENSE](LICENSE) for the complete license text.

---

## Project principle

**Beautiful on the surface. Solid underneath. Built for production.**

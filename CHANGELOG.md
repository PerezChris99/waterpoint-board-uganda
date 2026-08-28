# Changelog

## Phase 0 — Repository and foundation

- Initialized Git repository with `main` and `perez` branches.
- Scaffolded Next.js + TypeScript + Tailwind CSS frontend with initial design tokens and a landing shell.
- Scaffolded Flask backend with an application factory, environment-based config, centralized error handling, and a health-check endpoint.
- Added PostgreSQL connection via SQLAlchemy + Flask-Migrate (initial migrations directory).
- Added Docker Compose for local development (frontend, backend, PostgreSQL).
- Added environment variable templates for the root, frontend, and backend.
- Added linting (ESLint, Ruff), formatting (Prettier), and security scanning (Bandit) tooling.
- Added test runners (Vitest + React Testing Library, Pytest) with passing smoke tests.
- Added GitHub Actions CI pipeline for frontend and backend checks.
- Added initial documentation (README, ARCHITECTURE, API, SECURITY, PRIVACY, DATA-METHODOLOGY, CONTRIBUTING, DEPLOYMENT, CHANGELOG, development plan).

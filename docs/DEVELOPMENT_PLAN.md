# Development Plan

Tracks phase-by-phase progress for WaterPoint Board Uganda. Each phase must pass its checks before the next phase begins.

## Branch workflow

`feature/*` or `chore/*` or `fix/*` → `perez` (integration) → `main` (production). Never push directly to `main`. Never force-push to `main` or `perez`.

## Phases

- [x] **Phase 0 — Repository and foundation**
  - Git repository initialized, `main` and `perez` branches created and pushed.
  - Next.js + TypeScript + Tailwind frontend scaffolded (App Router, `src/` dir).
  - Flask backend scaffolded (application factory, blueprints structure, error handling, health check).
  - PostgreSQL connection configured via SQLAlchemy + Flask-Migrate.
  - Docker Compose for frontend, backend, and PostgreSQL.
  - Environment variable templates (`.env.example`) for root, frontend, and backend.
  - Linting (ESLint, Ruff) and formatting (Prettier) configured.
  - Test runners configured (Vitest + Testing Library, Pytest) with a passing smoke test each.
  - GitHub Actions CI pipeline (frontend lint/typecheck/test/build, backend lint/security/test/migration check).
  - Initial documentation (README, this development plan).
- [ ] **Phase 1 — Original design system and public shell**
- [ ] **Phase 2 — Public directory**
- [ ] **Phase 3 — Flask API and database**
- [ ] **Phase 4 — Authentication and roles**
- [ ] **Phase 5 — Community reporting**
- [ ] **Phase 6 — Caretaker tools**
- [ ] **Phase 7 — Admin tools**
- [ ] **Phase 8 — Analytics and exports**
- [ ] **Phase 9 — Security hardening**
- [ ] **Phase 10 — SEO, accessibility, and performance**
- [ ] **Phase 11 — Release preparation**

## Required checks before merging a feature branch into `perez`

- Frontend lint, TypeScript check, unit tests, production build.
- Backend lint (Ruff), security scan (Bandit), Pytest.
- Database migration check.
- Manual verification that no critical flow is broken.

## Required checks before merging `perez` into `main`

All of the above, plus: staging deployment verification, accessibility checks, end-to-end smoke tests, and a complete release checklist (Phase 11 only).

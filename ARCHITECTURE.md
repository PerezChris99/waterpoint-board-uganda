# Architecture

## Overview

```
Next.js/React frontend (TypeScript, Tailwind)
        |
        | HTTPS REST API (/api/v1)
        v
Flask backend (Blueprints, SQLAlchemy)
        |
        |-- PostgreSQL database
        |-- Object storage for report/maintenance images (later phase)
        |-- Analytics services (later phase)
        |-- CSV export services (later phase)
```

## Frontend

- Next.js App Router, TypeScript, Tailwind CSS v4 (CSS-variable-based design tokens in `src/app/globals.css`).
- Vitest + React Testing Library for unit/component tests.
- ESLint (flat config, `eslint-config-next`) + Prettier for linting/formatting.

## Backend

- Flask application factory (`backend/app/__init__.py`) wires up configuration, extensions (SQLAlchemy, Flask-Migrate, Flask-Limiter, CORS), centralized error handling, and blueprints.
- `backend/app/routes/` holds Flask Blueprints (starting with `health`).
- `backend/app/models/`, `schemas/`, `services/`, `security/` are reserved for the database models, request/response schemas, business logic, and security helpers added in later phases.
- Environment-based configuration (`development`, `testing`, `production`) in `backend/app/config.py`.

## Error contract

Every API error response follows:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "fields": {},
    "requestId": "req_123456"
  }
}
```

## Infrastructure

- Docker Compose runs `postgres`, `backend`, and `frontend` services locally.
- GitHub Actions CI (`.github/workflows/ci.yml`) runs frontend and backend checks on pull requests targeting `perez` and `main`.

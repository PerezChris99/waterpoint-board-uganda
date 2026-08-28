# Security

## Reporting a vulnerability

Please open a private security advisory on GitHub or contact the repository owner directly. Do not open a public issue for undisclosed vulnerabilities.

## Security model (current foundation)

- **Secrets:** stored only in environment variables (`.env`, never committed). `.env.example` files document required variables without real values.
- **CORS:** restricted to the configured frontend origin(s) via `CORS_ORIGINS`.
- **Cookies/sessions:** configured for `HttpOnly`, `SameSite=Lax`, and `Secure` in production (`SESSION_COOKIE_SECURE`).
- **Error handling:** a centralized error handler (`backend/app/errors`) ensures the API never returns tracebacks, SQL errors, internal paths, or other sensitive details — every error response uses a stable `{ error: { code, message, fields, requestId } }` shape.
- **Rate limiting:** Flask-Limiter is initialized with a conservative default (`200 per hour`) and will be tightened per-endpoint (auth, reports, uploads) in later phases.
- **Debug mode:** disabled by default outside of `development`/`testing` configs.
- **Dependency scanning:** `bandit` (Python) runs in CI; `npm audit` runs in CI for the frontend.

## Planned hardening (Phase 9)

Content Security Policy, additional security headers, CSRF protection where cookie-based auth requires it, upload hardening (MIME/size validation, random filenames, private storage until moderation), and full authorization test coverage.

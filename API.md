# API

Base path: `/api/v1`

## Implemented (Phase 0)

| Method | Path          | Auth | Description               |
| ------ | ------------- | ---- | -------------------------- |
| GET    | `/api/v1/health` | none | Service health check       |

## Planned

See the full endpoint list in [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) and the project specification. Public water-point/community endpoints arrive in Phase 3; authentication in Phase 4; reports in Phase 5; caretaker and admin endpoints in Phases 6–7; analytics/export endpoints in Phase 8.

## Error shape

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

The API never exposes tracebacks, SQL errors, password hashes, secrets, internal paths, private notes, or sensitive user data in responses.

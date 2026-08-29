# API

All endpoints are Next.js Route Handlers under `/api`. Responses are JSON unless noted.
Error shape:

```json
{ "error": { "message": "Human-readable message", "fields": {} } }
```

## Authentication

| Method | Path                | Auth       | Description                              |
| ------ | ------------------- | ---------- | ----------------------------------------- |
| POST   | `/api/auth/register` | none (rate-limited) | Create a `MEMBER` account, sets session cookie |
| POST   | `/api/auth/login`    | none (rate-limited) | Verify credentials, sets session cookie   |
| POST   | `/api/auth/logout`   | any        | Clears the session cookie                 |
| GET    | `/api/auth/me`       | any        | Returns the current session user, or `null` |

## Water points (public)

| Method | Path                     | Auth               | Description                          |
| ------ | ------------------------ | ------------------ | ------------------------------------- |
| GET    | `/api/water-points`      | none               | List, filterable by `status`, `type`, `village`, `q` |
| GET    | `/api/water-points/:id`  | none               | Detail, including recent reports and maintenance logs |
| PATCH  | `/api/water-points/:id`  | CARETAKER (own) / ADMIN | Update status, stamps `lastVerifiedAt` |

## Reports

| Method | Path                | Auth                     | Description                         |
| ------ | ------------------- | ------------------------ | ------------------------------------ |
| POST   | `/api/reports`      | none (rate-limited)      | Submit a community report            |
| GET    | `/api/reports`      | CARETAKER (own) / ADMIN  | List reports, filterable by `status`, `waterPointId` |
| PATCH  | `/api/reports/:id`  | CARETAKER (own) / ADMIN  | Update status / resolution notes     |

## Caretaker tools

| Method | Path                    | Auth                    | Description                 |
| ------ | ----------------------- | ----------------------- | ---------------------------- |
| POST   | `/api/maintenance-logs` | CARETAKER (own) / ADMIN | Log a maintenance action     |

## Admin tools

| Method | Path                     | Auth  | Description                       |
| ------ | ------------------------ | ----- | ---------------------------------- |
| GET    | `/api/admin/users`       | ADMIN | List all user accounts             |
| PATCH  | `/api/admin/users/:id`   | ADMIN | Change a user's role               |

## Analytics

| Method | Path                     | Auth              | Description                              |
| ------ | ------------------------ | ----------------- | ------------------------------------------ |
| GET    | `/api/analytics/summary` | CARETAKER / ADMIN | Status/issue/village counts for dashboards |
| GET    | `/api/analytics/export`  | ADMIN             | CSV export of all water points             |

## Rate limits (in-memory, per warm instance)

- Login: 10 requests / 15 minutes per IP.
- Registration: 5 requests / 15 minutes per IP.
- Report submission: 20 requests / hour per IP.

This is a per-instance limiter, not a distributed one — see
[SECURITY.md](SECURITY.md#known-limitations) for the tradeoff.

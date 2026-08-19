# Backend

FastAPI backend for the personal blog project. Stateless process; all schema changes go through Alembic.

## Responsibilities

- public tech blog APIs
- protected family album APIs
- admin-only user management APIs
- Google OAuth login plus an optional local demo login
- S3-compatible storage adapter (local MinIO / production AWS S3)

## Environment variables

- `DATABASE_URL`: PostgreSQL 16 DSN (required, no SQLite fallback)
- `CORS_ORIGINS`: comma-separated list of allowed origins
- `S3_ENDPOINT_URL`: set for local MinIO, leave empty in production to target real AWS S3
- `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`
- `ENABLE_DEMO_AUTH`: must be `true` to allow `X-Demo-User` / `/api/auth/dev-login`. Defaults to `false`; never enable in production.

## Local run

```bash
uvicorn app.main:app --reload
```

## Database migrations

The API process never creates or alters schema on startup. Apply migrations explicitly:

```bash
python -m alembic upgrade head
```

To generate a new revision after changing models:

```bash
python -m alembic revision --autogenerate -m "describe change"
python -m alembic upgrade head
```

## Seed data (optional, local only)

```bash
python -m app.scripts.seed
```

## Health check

```bash
curl http://localhost:8000/health
```

## Demo identity header (local only)

When `ENABLE_DEMO_AUTH=true`, requests may simulate an authenticated identity:

- `X-Demo-User`

Seeded users:

- `admin@example.com`
- `family@example.com`
- `guest@example.com`

Example:

```bash
curl -H 'X-Demo-User: family@example.com' http://localhost:8000/api/albums
```

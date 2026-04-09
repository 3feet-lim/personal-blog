# Backend

FastAPI-based backend skeleton for the personal blog MVP.

## Responsibilities

- public tech blog APIs
- protected family album APIs
- admin-only user management APIs
- provider-agnostic auth contract scaffolding
- MinIO/S3-compatible storage abstraction

## Local Run

```bash
uvicorn app.main:app --reload
```

## Demo Identity Headers

Local MVP behavior uses request headers to simulate authenticated identities until OAuth callbacks are wired:

- `X-Demo-User`

Seeded users:

- `admin@example.com`
- `family@example.com`
- `guest@example.com`

Example:

```bash
curl -H 'X-Demo-User: family@example.com' http://localhost:8000/api/albums
```

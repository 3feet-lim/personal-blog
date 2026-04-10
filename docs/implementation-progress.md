# Implementation Progress

## Objective

Advance the current MVP skeleton to the next implementation phase with focus on:

- Markdown rendering for blog detail pages
- Admin IA split across `/admin`, `/admin/blog`, `/admin/albums`, `/admin/users`
- Protected asset access policy alignment
- Google OAuth production-like flow clarification

## Working Rules

- Keep this document updated so work can resume cleanly in the next session.
- Record implementation decisions, active tasks, blockers, and latest test status.
- Prefer incremental delivery with repeated edit -> run -> test loops.

## Current Status

- Phase: code-complete, runtime verification completed
- Frontend agent: completed
- Backend agent: completed
- Spec agent: completed
- QA agent: completed

## Baseline Findings

- Public blog, protected album, admin dashboard, and local runtime are already implemented.
- Blog detail currently shows raw Markdown source instead of rendered output.
- Admin functionality is concentrated in `/admin` instead of split subroutes.
- Protected assets are served through `/api/assets/{id}/content`, but backend still exposes an `access-url` route that may conflict with the intended policy.
- Google OAuth endpoints exist, but the product flow is still centered around demo session UX.

## Planned Work

1. Finalize next-phase spec and acceptance criteria.
2. Implement frontend route split and Markdown rendering.
3. Align backend asset access policy and OAuth flow.
4. Add/update validation documentation.
5. Run implementation verification loops and update results here.
6. Resume container-level runtime verification after Docker daemon is available.

## Decision Log

- 2026-04-10: Chosen focus is gap-closing work on the current MVP instead of expanding product scope.
- 2026-04-10: A persistent progress document is required so interrupted sessions can resume without rediscovery.
- 2026-04-10: QA validation plan draft created at `docs/testing/next-phase-test-plan.md`.
- 2026-04-10: Progress handoff log also maintained at `docs/progress/next-implementation-log.md`.
- 2026-04-10: Protected asset direct access-url route was removed in favor of application-gated content access.
- 2026-04-10: Seeded sample asset startup behavior was fixed so MinIO always contains the object referenced by the sample album item.
- 2026-04-11: Browser-facing OAuth login URL was separated from container-internal backend URL.
- 2026-04-11: `3feet.lim@gmail.com` was added as an approved family user for local OAuth verification.

## Test Log

- Frontend:
  - `npm install`: passed
  - `npm run build`: passed
- Backend:
  - `python3 -m compileall app`: passed
  - virtualenv dependency install from `requirements.txt`: passed
  - smoke checks:
    - `GET /api/blog/posts` -> `200`
    - `GET /api/albums` anonymous -> `401`
    - `GET /api/albums` family -> `200`
    - `GET /api/admin/users` family -> `403`
    - `GET /api/admin/users` admin -> `200`
    - `GET /api/assets/1/content` anonymous -> `401`
- Container runtime:
  - `docker compose up --build -d`: passed
  - `docker compose ps`: frontend/backend/minio all up
  - container-internal checks:
    - `GET frontend /` -> `200`
    - `GET frontend /blog/bootstrapping-personal-blog` -> `200`
    - `GET backend /api/blog/posts` -> `200`
    - `GET backend /api/albums` anonymous -> `401`
    - `GET backend /api/albums` family -> `200`
    - `GET frontend /admin?as=admin@example.com` -> `200`
    - `GET frontend /album?as=family@example.com` -> `200`
    - `GET frontend /album/family-trip?as=family@example.com` -> `200`
    - `GET frontend /api/assets/1?as=family@example.com` -> `200`

## Resume Notes

- Primary handoff doc: `docs/progress/next-implementation-log.md`
- Runtime is currently up via Docker Compose.
- If resuming, start from UX cleanup or additional test automation rather than basic runtime repair.

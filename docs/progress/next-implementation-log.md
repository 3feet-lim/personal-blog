# Next Implementation Progress Log

## Objective

Close the highest-priority gaps between the MVP spec and the current implementation:

- Markdown rendering for blog detail pages
- Admin IA split into dedicated routes
- Protected asset access policy alignment
- Google OAuth real-use flow clarification

## Working Rules

- Keep this document updated so work can resume after interruption.
- Prefer small, isolated changes.
- Use build/test results to drive follow-up fixes.

## Agent Allocation

- `content-domain-designer`
  - Write the next-phase implementation spec
- `nextjs-developer`
  - Split admin routes
  - Improve login UX
  - Add Markdown rendering
- `python-pro`
  - Align protected asset policy
  - Clarify OAuth callback/session flow
- `qa-test-strategist`
  - Write the next-phase validation checklist

## Current Status

- `completed`: implementation
- `completed`: frontend production build
- `completed`: backend import/compile validation
- `completed`: backend access-control smoke tests
- `blocked`: full Docker runtime verification because Docker daemon is not running
- `remaining`: MinIO-backed authorized asset download end-to-end check in a live runtime

## Files Planned

- `docs/specs/next-phase-implementation-spec.md`
- `docs/testing/next-phase-test-plan.md`
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/layout.tsx`
- `frontend/app/admin/blog/page.tsx`
- `frontend/app/admin/albums/page.tsx`
- `frontend/app/admin/users/page.tsx`
- `frontend/app/blog/[slug]/page.tsx`
- `frontend/app/login/page.tsx`
- `frontend/components/markdown-content.tsx`
- `frontend/components/admin-overview.tsx`
- `frontend/components/admin-blog-manager.tsx`
- `frontend/components/admin-albums-manager.tsx`
- `frontend/components/admin-users-manager.tsx`
- `backend/app/api/routes/assets.py`
- `backend/app/api/routes/albums.py`
- `backend/app/api/routes/auth.py`

## Resume Notes

- Admin split is route-level only; backend APIs remain mostly unchanged.
- Protected assets should be served through authorized application routes, not direct object URLs.
- If execution/build fails because frontend dependencies are missing, install/update dependencies before retrying.
- Backend local runtime also needs `backend/data` to exist for SQLite at `sqlite:///./data/app.db`.

## Execution Log

### Completed

- Created:
  - `docs/specs/next-phase-implementation-spec.md`
  - `docs/testing/next-phase-test-plan.md`
  - split admin route files
  - reusable admin/Markdown components
- Updated protected asset policy:
  - removed `/api/assets/{id}/access-url`
  - album item metadata now points to `/api/assets/{id}/content`
- Clarified OAuth callback:
  - stores `auth_provider`
  - forwards `provider=google`
- Added `backend/data` directory for SQLite runtime

### Validation Results

- Frontend:
  - `npm install` completed
  - `npm run build` completed successfully
- Backend:
  - `python3 -m compileall app` completed successfully
  - `.venv` created and `requirements.txt` installed
  - smoke checks with MinIO bucket bootstrap stubbed:
    - `GET /api/blog/posts` -> `200`
    - `GET /api/albums` anonymous -> `401`
    - `GET /api/albums` family -> `200`
    - `GET /api/admin/users` family -> `403`
    - `GET /api/admin/users` admin -> `200`
    - `GET /api/assets/1/content` anonymous -> `401`
  - `docker compose up --build -d` failed because Docker daemon was unavailable:
    - `Cannot connect to the Docker daemon at unix:///Users/seokminlim/.docker/run/docker.sock`

## Next Resume Step

- Start the full local runtime and verify authorized image fetch against real MinIO:
  - frontend route `/api/assets/[id]`
  - backend route `/api/assets/{id}/content`

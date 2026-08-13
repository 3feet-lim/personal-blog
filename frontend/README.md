# Frontend

Next.js App Router MVP frontend for the personal blog project.

## Routes

- `/`
- `/blog`
- `/blog/[slug]`
- `/album`
- `/album/[slug]`
- `/login`
- `/admin`

## Local demo auth

OAuth is not fully implemented yet. Use query params on protected routes or the `/login` page to simulate a session:

- `family@example.com`
- `admin@example.com`
- `guest@example.com`

The frontend forwards the selected demo identity to the backend with the `x-demo-user` header so you can validate auth boundaries locally.

## Local E2E

Run the local Docker Compose stack from the repository root, then install the pinned test dependency from `frontend`:

```bash
docker compose up -d
npm install
npx playwright install chromium
```

Run `npm run test:e2e` when the host has Playwright's Linux browser dependencies. Install them once with `sudo npx playwright install-deps chromium`.

On Linux hosts where sudo is unavailable, use the bundled-browser Docker fallback instead:

```bash
npm run test:e2e:docker
```

It starts Playwright `v1.41.2-jammy` with host networking and is hard-coded to target only `http://localhost:3000`; it does not start or target non-local services. View the latest HTML report with `npm run test:e2e:report`.

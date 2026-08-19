# Frontend

Next.js 정적 export 프런트엔드. `output: "export"`로 빌드하며 서버 컴포넌트의 SSR, Route Handler, Server Action을 사용하지 않습니다. 모든 동적 데이터는 브라우저에서 `NEXT_PUBLIC_API_URL`이 가리키는 FastAPI 백엔드를 직접 호출해 가져옵니다.

## Routes

- `/`
- `/blog`
- `/blog/post?slug=...` (정적 셸 + 클라이언트에서 `slug` query로 조회)
- `/album`
- `/album/detail?slug=...` (정적 셸 + 클라이언트에서 `slug` query로 조회)
- `/login`
- `/admin`, `/admin/blog`, `/admin/albums`, `/admin/users`

## 환경변수

- `NEXT_PUBLIC_API_URL`: 브라우저가 호출할 API 주소. 하드코딩된 fallback이 없으므로 반드시 설정해야 합니다.
- `NEXT_PUBLIC_APP_NAME`: 상단 브랜드 표시용 (옵션).

## 로컬 개발

```bash
npm install
npm run dev
```

## 정적 빌드

```bash
npm run build
```

`out/` 디렉토리에 정적 파일만 생성됩니다. 로컬에서 산출물만 확인하려면:

```bash
npx serve out -l 4000
```

## 인증

세션은 서버 쿠키로 관리하는 API 인증(`credentials: "include"`)을 기본으로 합니다. 로컬 개발 편의를 위한 데모 로그인은 `lib/auth.ts`의 `useSession`과 `/login` 페이지에서 제공하며, 백엔드가 `ENABLE_DEMO_AUTH=true`일 때만 동작합니다.

- `family@example.com`
- `admin@example.com`
- `guest@example.com`

데모 이메일은 서버 쿠키가 아니라 브라우저 `localStorage`에 저장되며, API 요청 시 `x-demo-user` 헤더로 전달됩니다.

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

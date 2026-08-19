# 정적 export / PostgreSQL / S3 아키텍처 전환

`spec.md`를 기준으로 다음 아키텍처 결정이 확정되어 구현되었습니다. `docs/specs/`, `docs/decisions/`, `docs/runtime/approval-prefixes.md` 등 이전 문서에 남아 있는 SQLite-first, MinIO-only, Next.js SSR/Server Action 전제는 더 이상 유효하지 않으며, 아래 내용이 우선합니다.

## 확정된 계약

- 프런트: Next.js `output: "export"`. SSR, Route Handler, Server Action, `next/headers` 사용 금지. 모든 동적 데이터는 브라우저에서 `NEXT_PUBLIC_API_URL`로 FastAPI를 직접 호출.
- 백엔드: FastAPI, 포트 8000 고정, stateless. `DATABASE_URL`, `CORS_ORIGINS` 환경변수 필수.
- DB: PostgreSQL 16 전용. SQLite 미사용. 스키마 변경은 Alembic으로만 수행하며 `create_all()`을 사용하지 않음.
- 파일 저장: 로컬 MinIO / 운영 AWS S3. `S3_ENDPOINT_URL` 유무로 분기하며 업로드/다운로드 코드는 동일. DB에는 `object_key`만 저장(`storage_provider`, `bucket` 컬럼 없음). 운영 자격 증명은 ECS Task Role(IAM) 사용을 기본으로 하며 정적 키는 로컬 전용.
- 로컬 실행: Docker Compose `web`(3000) → `api`(8000) → `db`(5432), `api` → `minio`(9000/9001). 4개 서비스.
- 인증: 세션 쿠키 기반 API 인증이 기본. `X-Demo-User` / `/api/auth/dev-login`은 `ENABLE_DEMO_AUTH=true`일 때만 동작하며 운영 기본값은 `false`.
- 동적 상세 페이지(`/blog/[slug]`, `/album/[slug]`)는 정적 export와 호환되지 않아 `/blog/post?slug=...`, `/album/detail?slug=...` 정적 셸 + 클라이언트 조회 방식으로 전환.
- Google OAuth 콜백은 세션 쿠키(SessionMiddleware)로 로그인 상태를 이미 확정하므로, 프런트의 중간 경유 페이지(`/auth/oauth-complete`) 없이 `settings.frontend_url + next_path`(`/admin` 또는 `/album`)로 직접 302 리다이렉트한다. 정적 export 전환 시 해당 Route Handler를 삭제했으므로 백엔드도 더 이상 그 경로로 리다이렉트하지 않는다.

## 검증 방법

- `docker compose config --services` → `db`, `minio`, `api`, `web`
- `docker compose exec api python -m alembic upgrade head`
- `docker compose exec api python -m app.scripts.seed` (선택)
- `GET http://localhost:8000/health` → `200`
- `npm run build` → `frontend/out/`에 서버 런타임 없는 정적 파일만 생성

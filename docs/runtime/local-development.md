# 로컬 개발 런타임

## 토폴로지

로컬 런타임은 컨테이너 기반이며, 저장소 루트에서 Docker Compose로 기동합니다.

서비스 구성:

- `web`: `3000` 포트, `npm run dev`로 실행하는 Next.js 애플리케이션
- `api`: `8000` 포트에서 동작하는 FastAPI 애플리케이션
- `db`: `postgres:16-alpine`, 포트 `5432`
- `minio`: `9000`(API), `9001`(콘솔) 포트를 사용하는 로컬 객체 저장소

의존 관계: `web → api`, `api → db`(healthy), `api → minio`(healthy).

## 기본 모드

- 애플리케이션 데이터베이스: PostgreSQL 16 전용 (SQLite 없음)
- 객체 저장소: 로컬은 MinIO, 운영은 `S3_ENDPOINT_URL`을 비워 AWS S3 사용
- 스키마는 Alembic으로만 생성/변경 (컨테이너 자동 생성 없음)

## 환경 변수 계약

주요 변수:

- `NEXT_PUBLIC_API_URL`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `DATABASE_URL`
- `DEFAULT_AUTH_PROVIDER`
- `ENABLE_DEMO_AUTH`
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`
- `SESSION_HTTPS_ONLY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `S3_ENDPOINT_URL`
- `S3_BUCKET`
- `S3_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

## 인증 모드

- 데모 모드
  - `ENABLE_DEMO_AUTH=true`일 때만 시드 사용자와 `x-demo-user` 헤더 / `/api/auth/dev-login` 시뮬레이션 경로를 사용할 수 있습니다.
  - Google 애플리케이션 자격 증명은 필요하지 않습니다.
  - 운영 기본값은 `false`이며, 절대 운영에서 `true`로 설정하지 않습니다.
- 실제 OAuth 모드
  - 유효한 Google OAuth 자격 증명과 세션 비밀값이 필요합니다.
  - 콜백 URL은 로컬 컨테이너에서 사용하는 API 호스트와 일치해야 합니다.
  - 권장 값:
    - `GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback/google`
    - `SESSION_SECRET=<충분히_긴_랜덤_문자열>`

## 기동 방법

1. `.env.example`을 `.env`로 복사하고 필요한 값을 채웁니다.
2. `docker compose up -d --build`를 실행합니다.
3. 최초 기동 후 마이그레이션을 명시적으로 적용합니다: `docker compose exec api python -m alembic upgrade head`
4. 필요하면 샘플 데이터를 시드합니다: `docker compose exec api python -m app.scripts.seed`
5. 아래 주소로 접속합니다.
   - 프런트엔드: `http://localhost:3000`
   - 백엔드 API: `http://localhost:8000`
   - MinIO 콘솔: `http://localhost:9001`

## 참고 사항

- API 프로세스는 시작 시 어떤 DDL도 실행하지 않고 샘플 데이터도 자동 생성하지 않습니다. 마이그레이션과 시드는 항상 명시적으로 실행합니다.
- 로컬 MinIO 버킷은 `S3_ENDPOINT_URL`이 설정되어 있을 때만 업로드 시점에 자동 생성됩니다. 운영 S3 버킷은 사전에 프로비저닝되어 있어야 합니다.
- 프런트 정적 빌드(`npm run build`)는 `frontend/out/`에 서버 런타임 없는 정적 파일만 생성합니다.

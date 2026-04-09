# Personal Blog - Local Runtime

## 구조

루트 기준으로 컨테이너 런타임을 분리했습니다.

- `./frontend` 는 Next.js 앱을 담는 독립 컨테이너입니다.
- `./backend` 는 Python API를 담는 독립 컨테이너입니다.
- `./docker-compose.yml` 은 `frontend`, `backend`, `minio`, `postgres(optional)` 를 함께 실행합니다.
- 기본 데이터베이스는 SQLite입니다.

## 실행 전 준비

1. 환경 변수 파일을 복사합니다.

```bash
cp .env.example .env
```

2. `.env` 의 OAuth/비밀키 값은 필요 시 채웁니다.

## 인증 방식

현재 런타임은 두 가지 모드를 지원합니다.

- 데모 모드
  - 백엔드가 `X-Demo-User` 헤더 기반 데모 인증을 지원합니다.
  - 빠른 확인용으로는 브라우저에서 제공되는 데모 이메일 테스트 링크를 사용합니다.
- 실 OAuth 모드
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET` 를 설정하고 Google OAuth 흐름을 사용합니다.
  - `FRONTEND_URL` 은 OAuth 완료 후 돌아갈 프런트 주소입니다.
  - 세션 쿠키 동작을 조정하려면 `SESSION_COOKIE_NAME`, `SESSION_HTTPS_ONLY` 도 함께 봅니다.

예시:

```bash
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback/google
SESSION_SECRET=change-this-session-secret
FRONTEND_URL=http://localhost:3000
```

## SQLite 기본 실행(권장)

```bash
docker compose up --build
```

접속 포트

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## PostgreSQL 호환성 테스트(옵션)

PostgreSQL 컨테이너는 기본 실행에서 제외되며, 필요 시 profile로 별도 기동합니다.

1. `.env` 에서 `DATABASE_URL` 을 PostgreSQL DSN으로 변경

```bash
DATABASE_URL=postgresql://personal_blog:personal_blog@postgres:5432/personal_blog
```

2. Postgres 프로필로 실행

```bash
docker compose --profile postgres up --build
```

> PostgreSQL을 함께 띄우면 `backend` 는 `depends_on` 대신 환경변수 기반 `DATABASE_URL` 로 분기합니다.

## MinIO 버킷 정책

현재 MVP는 bucket 자동 생성 코드를 컨테이너 런타임에 강제하지 않고, 다음 계약으로 운영합니다.

- 버킷명: `STORAGE_BUCKET`
- 기본 예시: `personal-blog`
- 버킷은 backend 시작 시점 또는 최초 업로드 시점에서 생성되도록 백엔드 초기화 로직에서 처리 권장
- 운영 초기에 수동 생성이 필요한 경우 MinIO Console에서 버킷을 먼저 생성하면 됩니다.

## 정리

- `frontend`와 `backend`는 반드시 각자의 `Dockerfile`로 빌드됩니다.
- 로컬 기본값은 SQLite-first 입니다.
- PostgreSQL은 `--profile postgres`로 선택 실행해 호환성 점검을 할 수 있습니다.
- 데모 모드에서 앱 점검 시에는 브라우저 URL 파라미터 기반 로그인 흐름을 사용해도 됩니다.
- 실 OAuth 모드에서는 위의 OAuth 환경 변수를 모두 채우고, 운영 OAuth 설정에 맞게 `GOOGLE_REDIRECT_URI`를 맞춰주세요.

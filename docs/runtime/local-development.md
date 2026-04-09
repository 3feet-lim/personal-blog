# 로컬 개발 런타임

## 토폴로지

로컬 런타임은 컨테이너 기반이며, 저장소 루트에서 Docker Compose로 기동합니다.

서비스 구성:

- `frontend`: `3000` 포트에서 동작하는 Next.js 애플리케이션
- `backend`: `8000` 포트에서 동작하는 FastAPI 애플리케이션
- `minio`: `9000`, `9001` 포트를 사용하는 로컬 객체 저장소
- `postgres`: `postgres` 프로필 뒤에 있는 선택형 호환성 데이터베이스, 포트 `5432`

## 기본 모드

- 기본 애플리케이션 데이터베이스: SQLite
- 선택형 호환성 모드: `docker compose --profile postgres up`로 PostgreSQL 사용
- 기본 객체 저장소: MinIO

## 환경 변수 계약

주요 변수:

- `BACKEND_URL`
- `FRONTEND_URL`
- `DATABASE_URL`
- `DEFAULT_AUTH_PROVIDER`
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`
- `SESSION_HTTPS_ONLY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `STORAGE_PROVIDER`
- `STORAGE_ENDPOINT`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_SECURE`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`

## 인증 모드

- 데모 모드
  - UI와 접근 제어 동작을 개발하는 동안, 시드 데이터와 `x-demo-user` 기반 시뮬레이션 경로를 사용합니다.
  - Google 애플리케이션 자격 증명은 필요하지 않습니다.
- 실제 OAuth 모드
  - 유효한 Google OAuth 자격 증명과 세션 비밀값이 필요합니다.
  - 콜백 URL은 로컬 컨테이너에서 사용하는 백엔드 호스트와 일치해야 합니다.
  - 권장 값:
    - `GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback/google`
    - `SESSION_SECRET=<충분히_긴_랜덤_문자열>`

## 기동 방법

1. 로컬 오버라이드가 필요하면 `.env.example`을 `.env`로 복사합니다.
2. `docker compose up --build`를 실행합니다.
3. 아래 주소로 접속합니다.
   - 프런트엔드: `http://localhost:3000`
   - 백엔드 API: `http://localhost:8000`
   - MinIO 콘솔: `http://localhost:9001`

## 참고 사항

- 백엔드는 시작 시 로컬 SQLite 테이블과 샘플 데이터를 생성합니다.
- `postgres` 서비스는 선택 사항이며, 호환성 테스트용으로만 둡니다.
- OAuth 골격은 구현되어 있지만, 로컬 MVP 흐름은 시드된 사전 승인 사용자와 백엔드 인증 계약을 사용합니다.

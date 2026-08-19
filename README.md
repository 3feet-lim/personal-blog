# Personal Blog

## 스택

- 프런트: Next.js (`output: "export"`, 정적 SSG만, SSR 없음)
- 백엔드: FastAPI (포트 8000)
- DB: PostgreSQL 16 (SQLite 사용하지 않음)
- 파일 저장: 로컬 MinIO / 운영 AWS S3 (S3 호환 어댑터)
- 로컬 실행: Docker Compose (`web`, `api`, `db`, `minio`)

## 구조

- `./frontend`: Next.js 정적 export 프런트. 모든 동적 데이터는 브라우저에서 API를 직접 호출합니다.
- `./backend`: FastAPI 백엔드. stateless, DB 마이그레이션은 Alembic으로만 수행합니다.
- `./docker-compose.yml`: `web` → `api` → `db`, `api` → `minio` 의존성으로 4개 서비스를 실행합니다.

## 실행 전 준비

```bash
cp .env.example .env
```

`.env`에서 다음 값을 확인/수정합니다.

- `NEXT_PUBLIC_API_URL`: 브라우저가 호출할 API 주소 (로컬 기본값 `http://localhost:8000`)
- `DATABASE_URL`: PostgreSQL 16 DSN
- `CORS_ORIGINS`: 콤마로 구분된 허용 origin 목록 (로컬 기본값 `http://localhost:3000`)
- `S3_ENDPOINT_URL`, `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- OAuth를 사용하려면 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`

## 로컬 실행

```bash
docker compose up -d --build
```

접속 포트

- Frontend (`npm run dev`): `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## DB 마이그레이션 (Alembic)

앱 컨테이너는 스키마를 자동 생성하지 않습니다. 최초 기동 후 마이그레이션을 직접 적용합니다.

```bash
docker compose exec api python -m alembic upgrade head
```

새 revision을 추가할 때는:

```bash
docker compose exec api python -m alembic revision --autogenerate -m "설명"
docker compose exec api python -m alembic upgrade head
```

## 샘플 데이터 (선택)

로컬 개발용 샘플 사용자/게시물/앨범이 필요하면 명시적으로 실행합니다. API 시작 시 자동으로 실행되지 않습니다.

```bash
docker compose exec api python -m app.scripts.seed
```

## 파일/이미지 저장

- 이미지 등 바이너리는 오브젝트 스토리지에 저장하고, DB에는 `object_key`만 저장합니다.
- 로컬은 MinIO(S3 호환)를 사용하며, `S3_ENDPOINT_URL`이 설정되어 있으면 최초 업로드 시 버킷을 자동 생성합니다.
- 운영은 `S3_ENDPOINT_URL`을 비워 실제 AWS S3를 사용합니다. 이 경우 버킷은 자동 생성하지 않으며, 사전에 프로비저닝되어 있어야 합니다.
- 운영 자격 증명은 정적 액세스 키 대신 ECS Task Role(IAM)을 사용합니다. `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`를 비워두면 boto3 기본 자격 증명 체인이 적용됩니다.

## 인증

- 실제 로그인은 Google OAuth를 사용합니다. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`을 설정하면 동작합니다.
- 로컬 데모 로그인(`X-Demo-User` 헤더, `/api/auth/dev-login`)은 `ENABLE_DEMO_AUTH=true`일 때만 동작합니다. 로컬 `.env`는 기본적으로 `true`이며, Compose의 기본값은 `false`입니다. **운영 환경에서는 절대 `true`로 설정하지 마세요.**

## 정적 프런트 빌드/배포

```bash
cd frontend
npm run build
```

`out/` 디렉토리에 정적 파일만 생성됩니다(서버 런타임 없음). 운영 배포는 `out/`을 S3 등 정적 호스팅에 업로드합니다.

## 헬스체크

```bash
curl http://localhost:8000/health
```

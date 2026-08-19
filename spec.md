# 블로그 프로젝트 스펙

## 스택
- 프론트: Next.js (`output: 'export'`, SSG만, SSR 금지)
- 백엔드: FastAPI (포트 8000)
- DB: PostgreSQL 16
- 파일 저장: 로컬 MinIO / 운영 AWS S3 (S3 호환)
- 로컬: docker compose (web + api + db + minio)

## 프론트 (Next.js)
- 정적 export만. 동적 데이터는 클라이언트에서 API 호출.
- API 주소는 `NEXT_PUBLIC_API_URL` 환경변수 (하드코딩 금지)
- 로컬: `npm run dev` (핫 리로드, :3000)
- 운영: `npm run build` → `out/` → S3 업로드

## 백엔드 (FastAPI)
- 포트 8000 고정
- 환경변수: `DATABASE_URL`, `CORS_ORIGINS`
- `GET /health` → 200
- stateless, 마이그레이션은 Alembic
- 비밀값 하드코딩 금지, 실행 시 환경변수 주입

## DB
- PostgreSQL 16 (로컬도 동일 버전, SQLite 안 씀)

## 파일/이미지 저장
- 이미지 등 바이너리는 오브젝트 스토리지에 저장, DB에는 경로(키)만 저장
- 로컬: MinIO (S3 호환), 운영: AWS S3
- S3 접속값은 전부 환경변수:
  - `S3_ENDPOINT_URL` (로컬: http://minio:9000 / 운영: 비워둠=실제 S3)
  - `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `S3_ENDPOINT_URL` 유무로 로컬(MinIO)/운영(S3) 분기, 업로드/다운로드 코드는 동일
- 로컬 MinIO는 시작 시 버킷 자동 생성
- 운영은 액세스 키 대신 ECS Task Role(IAM)로 S3 접근

## 로컬 docker compose
- 서비스 4개: web(:3000, `npm run dev`), api(:8000), db(postgres:16, :5432), minio(:9000/:9001)
- 의존: web → api → db, api → minio
- 환경변수는 .env
- api의 CORS_ORIGINS에 http://localhost:3000 등록





 































 









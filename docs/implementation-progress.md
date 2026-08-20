# design-comparison.md 구현 진행 상황

`docs/design-comparison.md`에서 정리한 전체 항목 구현 작업의 현재 상태입니다.

## 1~5단계 (이전 세션에서 완료됨)

### 1. 백엔드 데이터 모델
- `Series` 모델 신설 (`slug`, `title`, `description`, `sort_order`)
- `BlogPost`에 `tags`(문자열 배열), `read_time`(정수, 분), `series_id`(FK) 추가
- `AlbumItem`에 `title` 추가 (기존 `caption`과 별도)
- Alembic migration(`b6dad3735bee`) 작성 및 실제 PostgreSQL에 적용 완료, 검증 완료

### 2. 백엔드 API
- `GET /api/blog/posts`에 `limit`/`offset` 페이지네이션 + `total` 추가
- 글 응답에 `tags`, `read_time`, `series` 포함
- `GET /api/blog/series` 신설 (시리즈별 게시글 수 포함)
- `GET /api/blog/tags` 신설 (태그 집계, 내림차순 정렬)
- `GET /api/blog/rss.xml` 신설 (RSS 2.0 XML)
- `POST /api/admin/series` 신설 (시리즈 생성)
- `POST /api/admin/blog/posts`에 `tags`, `series_slug` 반영, `read_time` 자동 계산(단어수/200)
- `POST /api/admin/albums/{id}/items/upload`에 `title` 필드 추가
- `GET /api/albums/feed/family`, `GET /api/albums/{slug}` 응답에 `item.title` 포함
- 전체 실제 API 호출로 검증 완료(글 생성, 시리즈 생성, 페이지네이션, 태그 집계, RSS)

### 3. 프런트엔드 - 폰트/로고/사이트 설정
- `next/font/google`로 `IBM Plex Sans KR`(300/400/700) + `Newsreader`(300/400/500) 로드
- `NEXT_PUBLIC_SITE_SUBTITLE` 환경변수 추가, `appName` 기본값을 "Jaeyoung's Notes"로 변경
- 헤더에 'j' 원형 로고 심볼(`.sigil`) 추가
- `globals.css`에 `--font-sans`/`--font-serif` 변수 재정의, 제목류에 세리프 적용

### 4. 프런트엔드 - 헤더 재구성
- `PostCounter` 컴포넌트 신설 (`{N} posts · {N} series` 표시)
- `RssLink` 컴포넌트 신설 (`apiUrl` 기반 RSS 링크)
- `lib/api.ts` 대폭 확장 (BlogPost 타입에 tags/read_time/series, Series/Tag 타입, 관련 함수 전체)
- 헤더 `.bar`에 `ModeToggleSlot`(좌측) + `PostCounter`(우측) 배치
- 우측 nav에 Archive/Tags/About 링크 추가 (페이지는 아직 미신설, 7단계 예정)

### 5. 프런트엔드 - Tech 피드 (진행 중, 거의 완료)
- 홈(`/`) 페이지: 최신글 강조 + 해시태그 + 읽기시간 + "Older posts →" 페이지네이션(offset 증가 방식) + 우측 사이드바(Series 목록/Tags 클라우드/이메일 구독 폼)
- `/blog` 목록 페이지: 태그/읽기시간 표시로 통일
- `/blog/post` 상세 페이지: 태그/읽기시간/시리즈명 표시
- `admin-blog-manager.tsx`: 태그 입력(쉼표 구분), 시리즈 선택 드롭다운, **시리즈 생성 폼** 추가 완료
- `globals.css`의 `.subscribe-box form` flex 레이아웃 보정 (input/button 겹침 수정)
- 타입체크(`tsc --noEmit`) 통과 확인

## 완료된 작업 (1~9단계, 전체 완료)

### 6. Family 피드 개선
- `/family` 페이지에 상단 부제("사진 한 장에 그날 하루. 아이가 나중에 읽을 수 있게 남겨둡니다.") 추가
- 월 구분선(`.rule`) 추가
- 그리드 아이템에 `title`(볼드, `.feed-item h3`) + `caption`(메모) 분리 표시로 변경
- `admin-albums-manager.tsx`의 업로드 폼에 `title` 입력 필드 추가, `uploadAlbumImage` 호출에 반영

### 7. Archive/Tags/About 페이지 + RSS (완료)
- `/archive`: 전체 게시글을 클라이언트에서 연도/월별로 그룹핑해 표시 (월 구분선 + 게시글 수)
- `/tags`: 태그 클라우드 + `?tag=` 쿼리 파라미터로 해당 태그 글 목록 필터링
- `/about`: 사이트 이름/서브타이틀 기반 정적 소개 페이지
- 홈페이지 사이드바 태그, 상세 페이지 태그를 `/tags?tag=...`로 연결(`a.tag`, `.tag.active` 스타일 추가)
- 백엔드 RSS 엔드포인트/헤더 링크는 기존대로 유지

### 8. 푸터 컴포넌트 (완료)
- `SiteFooter`를 하드코딩에서 환경변수 기반으로 변경: `NEXT_PUBLIC_FOOTER_TEXT`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_MASTODON_URL`
- `.env.example`에 신규 프런트 환경변수(`NEXT_PUBLIC_SITE_SUBTITLE`, `NEXT_PUBLIC_FOOTER_TEXT`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_MASTODON_URL`) 문서화

### 9. 통합 검증 (완료)
- 로컬 `.env`가 README/`.env.example` 스키마와 불일치(SQLite DSN, `STORAGE_*` 잔재)하던 문제를 발견해 `.env.example` 기준으로 재작성(기존 Google OAuth 자격증명 보존)
- 디스크 100% 가득 차 있던 문제 발견 → `docker builder prune`으로 9.8GB 회수 후 빌드 재개
- MinIO 데이터 볼륨이 이전 포맷과 호환되지 않아 손상(`Unknown xl header version 3`) → 사용자 승인 후 볼륨 삭제 및 재생성으로 해결
- `docker compose up -d --build` 전체 재기동 성공, `db`/`minio`/`api`/`web` 모두 healthy/기동 확인
- `alembic upgrade head` 적용, `app.scripts.seed` 실행
- 관리자 데모 로그인으로 시리즈/태그 포함 글을 실제 생성해 `/api/blog/posts`, `/api/blog/series`, `/api/blog/tags`, `/api/blog/rss.xml` 응답 확인
- `/`, `/blog/`, `/blog/post/`, `/archive/`, `/tags/`, `/tags/?tag=...`, `/about/`, `/family/`, `/login/`, `/admin/` 전체 라우트 200 응답 확인 (trailing slash 리다이렉트는 `next.config.js`의 `trailingSlash: true` 설정에 따른 정상 동작)
- `npx tsc --noEmit` 통과
- 컨테이너 내부(`docker compose exec web npx next build`, 별도 임시 디렉토리)에서 정적 export 빌드 성공 확인, 신규 라우트(`/archive`, `/tags`, `/about`) 포함 17개 페이지 모두 `out/`에 정적 생성됨 확인
- 브라우저 기반 Playwright 검증은 시도했으나 이 실행 환경에 Chromium 시스템 의존성(`libatk`, `libcairo2` 등)이 설치되어 있지 않아 실행 불가 — API 응답 확인 + 정적 export 결과물 확인으로 대체

## 다음 단계 제안

- 기존 `e2e/public-smoke.spec.ts`가 design-comparison.md 이전 UI 구조("Tech Blog 보기" 버튼, `/album` 경로 등) 기준으로 작성되어 현재 구현과 맞지 않음 — 새 UI에 맞춰 갱신 필요
- 브라우저 기반 e2e 검증을 위해 실행 환경에 Chromium 의존성 설치 필요 (`sudo npx playwright install-deps` 또는 `apt-get install libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libatspi2.0-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2`)
- 이메일 구독 폼은 현재 UI만 존재(제출 시 실제 동작 없음) — 실제 연동 여부 결정 필요
- 초대 코드 게이트 UI는 현재 Google OAuth 기반 접근 제어로 대체됨 — 재검토 필요 시 논의

## 코드 리뷰 후속 수정 (완료)

`docs/implementation-progress.md` 1~9단계를 "완료"로 표시한 뒤 진행한 코드 리뷰에서 실제 런타임/브라우저 재현으로 확인된 결함들을 아래 순서로 모두 수정했습니다.

1. **archive/tags의 limit 불일치**: `lib/api.ts`에 `getAllBlogPosts()` 페이지네이션 헬퍼(100건씩 순회, `total` 도달 시 중단) 추가. `/archive`, `/tags`가 이를 사용하도록 변경. 브라우저에서 422 없이 정상 로드 확인.
2. **관리자 폼 5곳의 `event.currentTarget.reset()` 버그**: `admin-blog-manager.tsx`(시리즈 생성/글 생성), `admin-albums-manager.tsx`(앨범 생성/이미지 업로드), `admin-users-manager.tsx`(사용자 등록)에서 `await` 전에 `const form = event.currentTarget`으로 캡처하도록 수정.
3. **한글 제목 slug 충돌**: `backend/app/api/routes/admin.py`의 `slugify()`가 정규화 결과가 빈 문자열이면 `untitled-{uuid4 8자리}` fallback을 반환하도록 수정. 완전 한글 제목 2건을 연속 생성해 서로 다른 slug가 부여됨을 API로 확인.
4. **MinIO 버킷 자동 생성 누락**: `upload_album_item`에서 `adapter.upload_bytes()` 호출 전에 `adapter.ensure_bucket()` 호출 추가. 신규 앨범에 실제 이미지 업로드로 확인.
5. **Compose 환경변수 미전달 및 기본 사이트명**: `docker-compose.yml`의 `web.environment`에 `NEXT_PUBLIC_SITE_SUBTITLE`/`FOOTER_TEXT`/`GITHUB_URL`/`MASTODON_URL` 추가, `NEXT_PUBLIC_APP_NAME` 기본값을 `personal-blog`에서 `Jaeyoung's Notes`로 수정. `.env`/`.env.example`도 동일하게 수정.
6. **Alembic downgrade 실패**: `b6dad3735bee` migration의 FK를 `blog_posts_series_id_fkey`로 명시적으로 이름 지정(PostgreSQL 자동 명명 규칙과 동일). 임시 DB에서 `upgrade head` → `downgrade -1`이 `downgrade_exit=0`으로 성공함을 확인.
7. **관리자 draft 관리 부재**: `AdminBlogPostUpdateIn` 스키마, `GET /api/admin/blog/posts`(draft 포함 전체 목록), `PATCH /api/admin/blog/posts/{id}`(상태 변경) 추가. 프런트에 발행하기/draft로 되돌리기 버튼 추가. draft 생성 → 발행 → 공개 API 노출 → draft 복귀 → 공개 API 404 흐름을 API로 확인.
8. **구 Playwright 테스트**: `e2e/public-smoke.spec.ts`를 현재 UI(헤더 Archive/Tags/About 링크, `/blog` Tech Blog, `/family` Access Denied) 기준으로 재작성. Docker Playwright로 3/3 통과.
9. **RSS 링크/채널명**: `backend/app/core/config.py`에 `site_name` 추가, RSS 링크에 trailing slash(`/blog/post/?slug=`) 추가, 채널 제목을 `site_name`으로 변경. Compose에서 `SITE_NAME`이 프런트와 같은 `NEXT_PUBLIC_APP_NAME` 값을 공유하도록 연결.
10. **통합 재검증**: `npx tsc --noEmit`, `python -m compileall`, `docker compose build api` + 전체 재기동, Alembic upgrade/downgrade, 관리자 draft/발행 흐름, MinIO 업로드, Playwright e2e, 컨테이너 내부 정적 export 빌드(17페이지, `archive`/`tags`/`about` 포함) 모두 통과 확인.

진행 중 로컬 셸 세션에 `NEXT_PUBLIC_APP_NAME=personal-blog`가 잔존 오염되어 있던 것을 재발견(5번 항목이 처음엔 반영되지 않은 것처럼 보였던 원인). `unset` 후 재기동으로 해결. 이 반복 이슈는 아래 "참고" 섹션에 이미 기록되어 있음.



- 셸 세션에 이전 검증 단계의 `DATABASE_URL=sqlite:///...` 환경변수가 잔존해 `docker compose` 실행 시 섞여 들어가는 문제가 여러 번 발생. `docker compose` 명령 전 항상 `unset DATABASE_URL S3_BUCKET`으로 정리 필요.
- `npm run build`(export 빌드) 실행 후 `.next` 캐시가 손상되어 `next dev`가 500을 내는 현상이 반복됨. 발생 시 `docker compose exec web rm -rf .next && docker compose restart web`으로 복구.
- 로컬에서 `npm run build`를 직접 실행하면 컨테이너(root)가 만든 `.next`에 대한 `EACCES` 권한 오류가 발생함. 로컬 uid로 소유권을 바꾸거나(`sudo chown`), 컨테이너 내부에서 별도 임시 디렉토리로 복사해 빌드하는 방식으로 우회 가능.
- 이 실행 환경은 디스크가 쉽게 100%까지 채워짐 (Docker 이미지/빌드캐시 누적). `docker builder prune`으로 정기적인 정리가 필요.
- MinIO 볼륨은 이미지 버전이 바뀌면 기존 데이터 포맷과 호환되지 않아 깨질 수 있음(`Unknown xl header version 3`). 로컬 전용 데이터이므로 문제 발생 시 볼륨을 삭제 후 재생성하면 됨.

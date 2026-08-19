# design-comparison.md 구현 진행 상황

`docs/design-comparison.md`에서 정리한 전체 항목 구현 작업의 현재 상태입니다.

## 완료된 작업 (1~5단계)

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

## 아직 진행하지 않은 작업 (6~9단계)

### 6. Family 피드 개선 (미착수)
- 상단 부제 텍스트 추가 ("사진 한 장에 그날 하루...")
- 월 구분선(`.rule`) 추가
- 그리드 아이템에 `title`(볼드) + `caption`(메모) 분리 표시 — 현재 `/family` 페이지는 `caption`만 사용 중, 백엔드는 이미 `title` 필드를 응답에 포함하고 있으므로 프런트 반영만 필요
- `admin-albums-manager.tsx`의 업로드 폼에 `title` 입력 필드 추가 필요 (백엔드는 이미 지원)

### 7. Archive/Tags/About 페이지 + RSS (부분 완료)
- 백엔드 RSS 엔드포인트는 완료, 프런트 헤더 링크도 연결됨
- **`/archive`, `/tags`, `/about` 페이지 자체는 아직 생성되지 않음** — 현재 헤더에 링크만 있고 클릭하면 404
  - `/archive`: 연도/월별 아카이브 뷰 필요
  - `/tags`: 태그별 글 목록 필터 뷰 필요
  - `/about`: 정적 소개 페이지 필요

### 8. 푸터 컴포넌트 (임시 버전만 존재)
- `SiteFooter` 컴포넌트는 3단계에서 임시로 생성됨 (저작권 + GitHub/Mastodon 링크, 하드코딩)
- 최종 완성 작업(설정 가능하게 만들지, 링크 실제 값 확정 등) 아직 미착수

### 9. 통합 검증 (미착수)
- 로컬 docker compose 전체 재기동 및 라우트 점검 아직 안 함
- 정적 export 빌드(`npm run build`) 검증 아직 안 함
- 실제 브라우저 기준 새 헤더/토글/사이드바가 깨지지 않는지 확인 필요

## 다음 진행 순서 제안

1. 6단계: Family 피드에 title/caption 분리, 부제, 월 구분선 반영 (백엔드 이미 준비됨, 프런트만 남음)
2. 7단계: `/archive`, `/tags`, `/about` 페이지 신설
3. 8단계: 푸터 최종 확정
4. 9단계: `docker compose up -d --build`, `npx tsc --noEmit`, `npm run build`(export) 순으로 전체 검증

## 참고: 반복 발생했던 환경 이슈

- 셸 세션에 이전 검증 단계의 `DATABASE_URL=sqlite:///...` 환경변수가 잔존해 `docker compose` 실행 시 섞여 들어가는 문제가 여러 번 발생. `docker compose` 명령 전 항상 `unset DATABASE_URL S3_BUCKET`으로 정리 필요.
- `npm run build`(export 빌드) 실행 후 `.next` 캐시가 손상되어 `next dev`가 500을 내는 현상이 반복됨. 발생 시 `docker compose exec web rm -rf .next && docker compose restart web`으로 복구.

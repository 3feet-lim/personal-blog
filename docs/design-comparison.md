# blog_portal.html vs 현재 프런트엔드 비교

`blog_portal.html`(이하 "기준")과 현재 구현된 프런트엔드(이하 "현재")를 비교합니다. 기준이 목표입니다.

---

## 1. 디자인 차이

### 폰트

| 항목 | 기준 | 현재 |
|---|---|---|
| 제목/본문(한글) | `IBM Plex Sans KR` (300/400/700) — Google Fonts, 산세리프 | `Georgia, Times New Roman, serif` — 세리프 |
| 제목/본문(영문) | `Newsreader` (300/400/500) — Google Fonts, 세리프 | 위와 동일 |
| 보조 텍스트(날짜/태그/카운터) | `-apple-system, BlinkMacSystemFont, sans-serif` (시스템 폰트) | `SFMono-Regular, Menlo, Consolas` (모노스페이스) |
| 로고 'j' 심볼 | `Georgia, serif` 200px (원형 보더 안) | 없음 |

**추가 필요:**
- `IBM Plex Sans KR`을 Google Fonts에서 로드 (font-weight 300, 400, 700)
- `Newsreader`를 Google Fonts에서 로드 (font-weight 300, 400, 500)
- 보조 텍스트에 시스템 산세리프(-apple-system) 적용, 현재의 모노스페이스를 대체
- 로고에 'j' 심볼 + 원형 보더 추가

### 사이트 이름 & 헤더

| 항목 | 기준 | 현재 |
|---|---|---|
| 사이트 이름 | "Jaeyoung's Notes" (크고 굵게, Newsreader 폰트) | "personal-blog" (대문자, 작은 크기) |
| 서브타이틀 | "ENGINEERING JOURNAL, SINCE 2021" | 없음 (config.ts의 appName만 사용) |
| 사이트 이름 크기 | ~1.3rem 이상, 로고 'j' 심볼과 함께 좌측 상단 | ~1.15rem, 텍스트만 |
| 우측 네비게이션 | `Archive, Tags, About, RSS` (텍스트 링크) | `Login`/`email+logout` (세션 상태만) |
| 하단 구분선 | 헤더 아래 가로 구분선(`.rule`) | 있음 (`border-bottom`) |

**추가 필요:**
- 사이트 이름을 `NEXT_PUBLIC_APP_NAME` 대신 새 환경변수 또는 설정 가능한 값으로 변경 ("Jaeyoung's Notes")
- 서브타이틀 설정 기능 추가 ("Engineering journal, since 2021")
- 'j' 심볼 로고 (원형 보더 + Georgia 세리프)
- 우측 상단에 `Archive`, `Tags`, `About`, `RSS` 링크 추가 (각각 실제 기능은 추후 구현, 우선 링크만)
- 사이트 이름/서브타이틀을 관리자가 설정할 수 있는 기능 (환경변수 또는 admin 설정 API)

### Tech/Family 토글

| 항목 | 기준 | 현재 |
|---|---|---|
| 디자인 | pill 형태, 좌측 정렬, `hidden` 속성으로 권한 없으면 숨김 | pill 형태, 좌측 정렬 (유사함) |
| 위치 | 헤더 아래 구분선 아래, 카운터("38 posts · 6 series")와 같은 줄 | 헤더 내부 brand-group 안 |

**추가 필요:**
- 토글 위치를 헤더 밖으로 이동 (헤더 아래 구분선 아래)
- 같은 줄 우측에 `{N} posts · {N} series` 카운터 표시

### Tech 피드 (메인 블로그 목록)

| 항목 | 기준 | 현재 |
|---|---|---|
| 최상단 기사 | `LATEST / 날짜` eyebrow + 큰 제목(h2) + 요약 + 태그 + 읽기 시간 | `LATEST / 날짜` eyebrow + 큰 제목 + 요약만 |
| 나머지 목록 아이템 | 날짜(왼쪽), 제목, 요약, 태그 행 | 날짜, 제목, 요약 (태그 없음) |
| 태그 표시 | 각 글에 `span.tag`로 해시태그 배열 (예: `next.js`, `rsc`, `perf`) | 없음 |
| 읽기 시간 | 태그 줄 마지막에 `12 min read` 형태로 표시 | 없음 |
| "Older posts →" 링크 | 목록 하단에 존재 | 없음 |
| 우측 사이드바 | Series 목록(제목+글 수), Tags 클라우드, 이메일 구독 박스 | Stats(글 수)만 있음 |

**추가 필요:**
- `BlogPost` 모델/API에 `tags` 필드 추가 (문자열 배열)
- `BlogPost` 모델/API에 `read_time` 필드 추가 (분 단위, 계산 또는 입력)
- 프런트에서 각 글 아이템에 태그 뱃지(`span.tag`) 렌더링
- 프런트에서 읽기 시간 표시
- "Older posts →" 페이지네이션 또는 더보기 링크
- 우측 사이드바에 Series 목록 (백엔드 series 개념 신설 필요)
- 우측 사이드바에 Tags 클라우드 (전체 태그 집계 API)
- 우측 사이드바에 이메일 구독 폼 (실제 기능은 Mailchimp/자체 구현 추후 결정)

### Family 피드 (가족 앨범)

| 항목 | 기준 | 현재 |
|---|---|---|
| 상단 카피 | `PRIVATE · 승인된 N명만 볼 수 있어요` + `우리 집 기록` + 부제("사진 한 장에 그날 하루...") | `PRIVATE · 승인된 N명만 볼 수 있어요` + `우리 집 기록` (부제 없음) |
| 연도 필터 | 우측 정렬, pill 형태, `aria-current` 활성 표시 | pill 형태 (유사함) |
| 월 구분 | `August · 5 entries` + 가로 구분선 + 3열 그리드 | `August · 5 entries` + 3열 그리드 (구분선 없음) |
| 각 그리드 아이템 | PHOTO 4:3 이미지 + 날짜 + 제목(볼드) + 짧은 메모 | 이미지 + 날짜 + 캡션 (제목/메모 분리 안 됨) |

**추가 필요:**
- 상단에 부제 추가 ("사진 한 장에 그날 하루. 아이가 나중에 읽을 수 있게 남겨둡니다.")
- 월 구분선(`.rule`) 추가
- 각 아이템에 제목과 메모를 분리해서 표시 (현재 `caption` 하나뿐 → `AlbumItem`에 `title` 필드 추가 필요?)
- 비로그인 사용자용 "초대 코드 입력" 게이트 UI (기준에는 코드 입력 모달이 있음, 현재는 단순 Access Denied 메시지)

### 푸터

| 항목 | 기준 | 현재 |
|---|---|---|
| 구조 | `© 2026 Jaeyoung Kim` + GitHub/Mastodon 링크 | 없음 |

**추가 필요:**
- 푸터 컴포넌트 신설 (저작권 + 소셜 링크)
- 저작권 텍스트/소셜 링크를 설정 가능하게 할지 결정

---

## 2. 기능 차이

### 존재하지 않는 기능 (백엔드 + 프런트)

| 기능 | 기준 상태 | 현재 상태 |
|---|---|---|
| **글 태그(해시태그)** | 각 글에 태그 배열 표시, 사이드바에 태그 클라우드 | `BlogPost` 모델에 `tags` 필드 없음 |
| **읽기 시간** | 각 글에 `N min read` 표시 | 없음 |
| **시리즈(Series)** | 사이드바에 시리즈 목록 (이름 + 글 수) | Series 개념 자체가 없음 |
| **이메일 구독** | 사이드바에 구독 폼 (이메일 입력 + 구독 버튼) | 없음 |
| **RSS 피드** | 헤더에 RSS 링크 | 없음 |
| **Archive 페이지** | 헤더에 Archive 링크 | 없음 (전체 글 목록이 홈이므로 유사하지만 연도/월 아카이브 기능은 없음) |
| **About 페이지** | 헤더에 About 링크 | 없음 |
| **Tags 페이지** | 헤더에 Tags 링크 | 없음 |
| **사이트 이름 설정** | 하드코딩 "Jaeyoung's Notes" | `NEXT_PUBLIC_APP_NAME` 환경변수만 (서브타이틀은 설정 불가) |
| **로고 심볼** | 'j' 글자 + 원형 보더 | 없음 |
| **카운터(통계)** | `38 posts · 6 series` | `{N} posts` 만 표시 |
| **Older posts 페이지네이션** | 목록 하단 "Older posts →" | 전체 목록만 한 번에 표시 |
| **Family 아이템 제목/메모 분리** | 제목(볼드) + 메모(본문) 분리 | `caption` 하나만 |
| **초대 코드 게이트** | 비로그인 사용자에게 코드 입력 모달 | 단순 Access Denied 텍스트 |
| **푸터** | 저작권 + 소셜 링크 | 없음 |
| **포스트 수 표시 위치** | 토글 옆 같은 줄(`38 posts · 6 series`) | 사이드바 Stats 블록 안 |
| **"Older posts →" 더보기** | 글 목록 아래 | 없음 (전체 로딩) |

### 이미 구현된 기능 (기준에서도 동일 또는 유사)

- Tech/Family 토글 (권한 기반 표시/숨김)
- 연도 필터 + 월별 그룹핑
- 승인된 인원 수 표시
- 사진 그리드 (3열 auto-fill)
- Google OAuth 로그인 (기준은 "초대 코드" 방식이지만 본질은 동일 — 인가된 사용자만 Family 접근)
- 관리자 사용자 관리 (기준에는 없지만 현재가 더 고급)

---

## 3. 우선순위 제안

### 높음 (디자인 통일성에 직결)
1. 폰트 교체: `IBM Plex Sans KR` + `Newsreader` 로드
2. 사이트 이름/서브타이틀 설정 ("Jaeyoung's Notes", "Engineering journal, since 2021")
3. 로고 'j' 심볼 추가
4. 글 태그(해시태그) 기능 (`BlogPost.tags` 백엔드 + 프런트)
5. 읽기 시간 표시 (`read_time` 계산)
6. 토글 위치 조정 (헤더 밖으로, 카운터와 같은 줄)
7. 우측 헤더 네비게이션 링크 추가 (Archive, Tags, About, RSS)
8. 푸터 추가

### 중간 (기능 확장)
9. Series 개념 도입 (백엔드 모델 + 사이드바 표시)
10. Tags 클라우드 (전체 태그 집계)
11. 이메일 구독 폼 (UI만 또는 실제 연동)
12. Older posts 페이지네이션
13. Archive 페이지
14. Family 아이템에 title/memo 분리

### 낮음 (추후 결정)
15. About 페이지 내용
16. RSS XML 피드 생성
17. 초대 코드 게이트 UI (현재는 Google OAuth로 대체, 필요성 재검토)
18. Tags 전용 페이지

---

## 4. 데이터 모델 변경 필요 항목

| 모델 | 필드 | 비고 |
|---|---|---|
| `BlogPost` | `tags: list[str]` (또는 별도 Tag 테이블 M:N) | 해시태그 기능 |
| `BlogPost` | `read_time: int` (분 단위) | 계산(content 길이 기반) 또는 작성 시 입력 |
| 신규 `Series` | `id, slug, title, description, sort_order` | 시리즈 기능 |
| `BlogPost` | `series_id: FK(Series)` | 시리즈 소속 |
| `AlbumItem` | `title: str` (기존 caption과 별도) | Family 아이템 제목/메모 분리 |
| 사이트 설정 | `site_name, subtitle, logo_char, footer_text, social_links` | 환경변수 또는 별도 Settings 테이블 |

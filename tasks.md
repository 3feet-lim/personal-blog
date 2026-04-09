# 구현 작업 할당

이 문서는 제품/도메인 스펙을 기준으로 현재 사용 가능한 서브 에이전트에 구현 중심 작업을 할당합니다.

- 스펙 참조: `docs/specs/product-domain-spec.md`

목표는 구현 작업을 책임 범위, 의존성, 기대 산출물이 분명한 단위로 나누는 것입니다.

## 1. `content-domain-designer`

### 책임

프레임워크별 코드 구현은 맡지 않고, 제품/도메인 결정을 구현 가능한 구조로 정제합니다.

### 작업

- 아래 영역의 정보 구조를 검토하고 구체화합니다.
  - 랜딩 페이지
  - 공개 기술 블로그
  - 비공개 가족 앨범
  - 관리자 영역
- 아래 접근 경계 정의를 확정합니다.
  - anonymous
  - authenticated
  - authorized family member
  - admin
- 아래 도메인 간 초기 경계를 정의합니다.
  - blog domain
  - album domain
  - auth domain
  - asset/storage domain
- 아래 제품 미확정 사항에 대해 구현용 기본값을 제안하고 확정합니다.
  - 가족 앨범 접근 정책
  - 전역 권한 vs 앨범별 권한
  - 이미지 다운로드 정책
  - 블로그 작성 포맷
- 다른 에이전트가 참고할 수 있는 최종 구현 결정 메모를 작성합니다.

### 산출물

- 정제된 도메인 결정 문서
- 접근 정책 매트릭스
- MVP 페이지/기능 범위 표

### 의존성

- 없음

## 2. `nextjs-developer`

### 책임

Next.js 기반 프런트엔드 애플리케이션 구조와 UI 라우트를 담당합니다.

### 작업

- 아래를 위한 Next.js 프런트엔드 구조를 스캐폴딩합니다.
  - 랜딩 페이지
  - 공개 블로그 페이지
  - 보호된 가족 앨범 페이지
  - 로그인 페이지
  - 관리자 페이지
- 아래 경계에 맞춰 라우트 그룹과 레이아웃 경계를 구현합니다.
  - public pages
  - protected pages
  - admin pages
- 백엔드 세션/인증 상태에 맞춘 인증 인지형 내비게이션과 라우트 가드를 추가합니다.
- 아래 두 영역으로 명확히 분기되는 랜딩 페이지를 구성합니다.
  - Tech Blog
  - Family Album
- 아래 화면에 필요한 프런트 데이터 계약을 정의합니다.
  - 블로그 목록/상세
  - 앨범 목록/상세
  - 현재 사용자 세션
- 아래 미디어 렌더링 흐름을 통합합니다.
  - 공개 블로그 이미지
  - 보호된 가족 앨범 자산
- 콘텐츠 및 사용자 관리를 위한 관리자 UI 골격을 준비합니다.

### 산출물

- Next.js app/router 구조
- 초기 페이지 구현
- 공통 레이아웃/내비게이션 컴포넌트
- 프런트엔드 인증 가드 전략
- 백엔드 정렬을 위한 API 계약 가정 문서

### 의존성

- `content-domain-designer`의 접근 규칙 확정이 필요합니다.
- 백엔드 관련 작업에서 API/세션 계약이 정리되어야 합니다.

## 3. `python-pro`

### 책임

Python 백엔드 서비스, 도메인 모델링, API 설계, 저장소 추상화, 인증 연동 표면을 담당합니다.

### 작업

- 아래 모듈로 분리된 백엔드 프로젝트 구조를 정의합니다.
  - auth
  - users
  - blog
  - albums
  - assets
- 아래 엔터티에 대한 초기 관계형 스키마를 설계하고 구현합니다.
  - users
  - auth identities
  - blog posts
  - albums
  - album items
  - assets
- 아래 환경 간 스키마 이식성을 확보합니다.
  - 로컬 개발/테스트용 SQLite
  - 운영용 PostgreSQL
- 아래 확장을 고려한 OAuth 준비형 인증 도메인을 구현합니다.
  - 현재 Google
  - 이후 Naver
  - 이후 추가 제공자
- 아래 인가 검사를 구현합니다.
  - 공개 블로그 접근
  - 보호된 앨범 접근
  - 관리자 전용 작업
- 아래 저장소 추상화를 설계하고 구현합니다.
  - 기본 로컬 객체 저장소로서의 MinIO
  - 이후 S3 호환 확장
- 아래 초기 API 엔드포인트를 노출합니다.
  - auth/session
  - blog
  - albums
  - asset access
  - admin operations

### 산출물

- Python 백엔드 앱 골격
- 초기 모델과 마이그레이션
- 인증 제공자 추상화
- 저장소 어댑터 추상화
- MVP API 엔드포인트

### 의존성

- `content-domain-designer`의 도메인/접근 결정이 필요합니다.

## 4. `local-runtime-specialist`

### 책임

로컬 개발 런타임과 컨테이너 오케스트레이션 설계를 담당합니다.

### 작업

- 아래를 위한 로컬 Docker Compose 토폴로지를 설계합니다.
  - frontend
  - backend
  - MinIO
  - 선택형 PostgreSQL 호환성 서비스
- 아래 범주의 로컬 환경 변수 계약을 정의합니다.
  - 데이터베이스 선택
  - OAuth 설정
  - 저장소 설정
  - 프런트/백엔드 서비스 URL
- 기본 로컬 개발 모드를 결정합니다.
  - SQLite 우선 경량 흐름
  - 선택형 PostgreSQL 호환성 흐름
- 각 주요 파트를 독립적으로 컨테이너화할 수 있도록 이미지/컨테이너 경계를 준비합니다.
- 아래 개발자 로컬 워크플로우를 문서화합니다.
  - 부팅
  - 마이그레이션
  - 시드/초기화
  - 파일 저장소 초기화

### 산출물

- `docker-compose` 설계
- 로컬 환경 변수 계약
- 컨테이너/Dockerfile 전략 메모
- 개발자 부트스트랩 워크플로우

### 의존성

- 백엔드/프런트엔드 런타임 가정이 필요합니다.

## 5. `qa-test-strategist`

### 책임

MVP 구현을 위한 테스트 전략, 회귀 우선순위, 품질 기준을 담당합니다.

### 작업

- 아래를 대상으로 위험 기반 테스트 계획을 정의합니다.
  - auth callback/session flow
  - authorization boundaries
  - protected asset access
  - SQLite/PostgreSQL behavior differences
  - MinIO-backed asset flows
- 아래 계층으로 나뉜 테스트 피라미드를 제안합니다.
  - unit tests
  - integration tests
  - end-to-end smoke tests
- 아래 항목에 대한 MVP 인수 기준을 정의합니다.
  - 공개 블로그 탐색
  - 보호된 가족 앨범 접근
  - 관리자 전용 관리 흐름
- 향후 제공자 확장을 위한 회귀 체크리스트를 명시합니다.
  - Google
  - Naver
  - additional OAuth providers

### 산출물

- 테스트 전략 문서
- MVP 인수 체크리스트
- 고위험 회귀 매트릭스

### 의존성

- API/페이지/인증 설계가 먼저 안정화되어야 합니다.

## 6. `explorer`

### 책임

구현이 진행되는 동안 코드베이스와 아키텍처를 목적에 맞게 탐색합니다.

### 작업

- 현재 저장소 구조를 점검하고 누락된 스캐폴딩을 식별합니다.
- 아래와 같은 구체적인 구현 질문에 답합니다.
  - existing framework setup
  - current directory conventions
  - reusable modules
  - config file gaps
- 구현 주체를 맡기보다는 다른 에이전트를 위한 집중 탐색 작업을 지원합니다.

### 산출물

- 집중 탐색 메모
- 파일/경로 추천
- 구현 작업을 위한 제약 조건 정리

### 의존성

- 구체적인 질문이 생길 때 요청 기반으로 동작합니다.

## 7. `worker`

### 책임

아키텍처와 책임 경계가 명확해진 뒤, 범위가 제한된 구현 조각을 담당합니다.

### 작업

- 명시적인 파일 소유 범위를 가진 독립 기능을 구현합니다. 예:
  - frontend route slice
  - backend auth module
  - storage adapter
  - admin page section
  - migration set
- 리뷰나 테스트 이후의 후속 수정 작업을 수행합니다.
- 이미 정의된 경우를 제외하고, 가로지르는 아키텍처 결정을 새로 만들지 않습니다.

### 산출물

- 할당된 파일에 대한 구체적 코드 변경
- 집중 구현 메모

### 의존성

- 범위가 제한된 소유권과 명확한 쓰기 대상이 전달되어야 합니다.

## 8. `default`

### 책임

산출물을 통합하고, 충돌을 조정하며, 실행 순서를 관리하는 조정자 역할을 합니다.

### 작업

- 구현 계획과 실행 순서를 유지합니다.
- 설계 산출물을 구체적인 작업 배치로 변환합니다.
- 쓰기 범위가 겹치지 않을 때 병렬 작업을 할당합니다.
- 프런트엔드, 백엔드, 로컬 런타임 전반의 통합 위험을 검토합니다.
- 최종 구현이 원래 스펙과 일치하는지 확인합니다.

### 산출물

- 조정된 구현 계획
- 통합 결정 사항
- 최종 일관성 검토

### 의존성

- 작업이 진행될수록 모든 전문 에이전트의 산출물에 의존합니다.

## 9. 권장 실행 순서

1. `content-domain-designer`
2. `python-pro`
3. `nextjs-developer`
4. `local-runtime-specialist`
5. `qa-test-strategist`
6. `worker`
7. `explorer`
8. `default`

## 10. 작업 할당 메모

- `content-domain-designer`가 먼저 제품/접근 관련 애매한 부분을 닫아야 합니다.
- `python-pro`는 인증, 저장소, 보호 자산 접근이 나머지 시스템에 큰 영향을 주므로 백엔드 계약을 초기에 정의해야 합니다.
- `nextjs-developer`는 라우트 경계와 기본 API 계약이 안정되면 병렬 진행할 수 있습니다.
- `local-runtime-specialist`는 구현이 넓게 퍼지기 전에 Compose와 환경 변수 규칙을 확정해야 합니다.
- `qa-test-strategist`는 MVP 완료 전에 검증 계획을 잠가야 합니다.
- `worker` 에이전트는 명시적인 파일 소유 범위를 가진 좁은 구현 조각에만 사용해야 합니다.
- `explorer`는 대상이 분명한 저장소 질문에 답해야 하며, 산출물 책임을 가져가면 안 됩니다.
- `default`는 계속 통합 책임을 유지합니다.

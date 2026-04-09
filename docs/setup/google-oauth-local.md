# Google OAuth 로컬 설정

## 1. Google Cloud Console 설정

1. 프로젝트를 새로 만들거나 기존 프로젝트를 선택합니다.
2. `APIs & Services > OAuth consent screen` 으로 이동합니다.
3. 아래 항목을 입력합니다.
   - 앱 이름
   - 사용자 지원 이메일
   - 개발자 연락처 이메일
4. 개인 프로젝트 기준으로 `External` 을 선택합니다.
5. 테스트 사용자에 실제 로그인할 Google 계정을 추가합니다.
6. `Credentials > Create Credentials > OAuth client ID` 로 이동합니다.
7. 애플리케이션 유형은 `Web application` 을 선택합니다.

## 2. Redirect URI 와 Origin

아래 값을 등록합니다.

- Authorized redirect URI
  - `http://localhost:8000/api/auth/callback/google`
- Authorized JavaScript origin
  - `http://localhost:3000`

## 3. Google 에서 받아와야 할 값

Google Cloud Console 에서 아래 두 값을 복사합니다.

- `Client ID`
- `Client Secret`

## 4. 로컬 `.env` 설정

아래 값을 채웁니다.

```env
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback/google
```

## 5. 실행

```bash
docker compose up -d --build frontend backend
```

브라우저에서 아래로 접속합니다.

- `http://localhost:3000/login`

그 다음 아래 버튼을 누릅니다.

- `Google 로그인 시작`

## 6. 기대 동작

- 관리자 계정이면 `/admin` 으로 이동
- 가족 사용자 계정이면 `/album` 으로 이동

OAuth 성공 후 흐름은 아래와 같습니다.

- 백엔드 콜백: `/api/auth/callback/google`
- 프런트 완료 처리: `/auth/oauth-complete`

## 7. 빠른 확인 항목

- Google Console 의 Redirect URI 가 정확히 아래와 같은지 확인
  - `http://localhost:8000/api/auth/callback/google`
- 로그인할 Google 계정이 테스트 사용자에 추가되어 있는지 확인
- `.env` 에 아래 값이 비어 있지 않은지 확인
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `SESSION_SECRET`
- `FRONTEND_URL` 이 `http://localhost:3000` 인지 확인

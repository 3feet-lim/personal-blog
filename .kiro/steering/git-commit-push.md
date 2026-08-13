---
inclusion: manual
---

# Git Commit & Push

Git diff를 분석하여 커밋 메시지를 자동 생성하고, 커밋 후 push합니다.

## 실행 단계

1. `git diff --staged`를 먼저 확인. staged 변경사항이 없으면 `git diff`와 `git status`로 unstaged 변경사항을 확인.
2. 변경사항이 전혀 없으면 "커밋할 변경사항이 없습니다"라고 알려주고 중단.
3. **브랜치 안전장치**: `git branch --show-current`로 현재 브랜치를 확인.
   - 현재 브랜치가 `main` 또는 `master`이고, 사용자가 이번 요청에서 해당 브랜치로의 커밋·push를 **명시적으로 요청하지 않은** 경우:
     - "현재 `<브랜치>` 브랜치입니다. 보호 브랜치에 직접 커밋·push하는 것은 권장되지 않습니다. `feature/*` 또는 `fix/*` 브랜치에서 작업하거나, 정말로 직접 push하려면 명시적으로 요청해주세요."라고 안내하고 **커밋·push를 수행하지 않고 중단**한다.
   - 사용자가 `main`/`master`로의 push를 **명시적으로 요청한 경우**(예: "main에 직접 push해줘", "master에 커밋하고 푸시해줘")에는 경고를 한 번 안내한 뒤 그대로 진행한다.
   - 그 외 브랜치(`feature/*`, `fix/*`, `develop` 등)는 경고 없이 다음 단계로 진행한다.
4. unstaged 변경사항만 있으면 `git add -A`로 모든 변경사항을 staging.
5. diff 내용을 분석하여 Conventional Commits 형식으로 커밋 메시지 작성:a
   - 형식: `type(scope): 설명`
   - type: feat, fix, docs, style, refactor, test, chore 중 적절한 것 선택
   - scope: 변경된 주요 모듈/디렉토리
   - 설명: 한국어로 간결하게
   - 예: `feat(auth): 로그인 기능 추가`, `fix(api): 응답 파싱 오류 수정`
6. 사용자가 메시지를 함께 입력했다면, 그 메시지를 커밋 메시지로 사용.
7. `git commit -m "메시지"`로 커밋.
8. `git push`로 push. push 실패 시 에러 내용을 알려줌.
9. 최종 결과를 간단히 요약.

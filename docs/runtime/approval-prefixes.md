# 자동 승인용 Prefix 목록

## 목적

이 문서는 에이전트가 작업 중 승인 요청을 덜 멈추고 진행할 수 있도록, 미리 승인해둘 만한 명령 prefix를 정리한 것입니다.

중요:

- 자동승인은 `명령 전체`가 아니라 `prefix` 단위로 저장됩니다.
- 아래 목록은 문서에 적어둔다고 자동 적용되지 않습니다.
- 실제 적용은 승인 팝업에서 해당 prefix를 허용해야 합니다.

## 이 세션에서 실제로 사용한 명령 계열

### Git

- `git status`
- `git branch --show-current`
- `git remote -v`
- `git add .`
- `git commit`
- `git push origin`

권장 prefix:

- `["git", "status"]`
- `["git", "branch"]`
- `["git", "remote"]`
- `["git", "add", "."]`
- `["git", "commit"]`
- `["git", "push", "origin"]`

### Docker Compose

- `docker compose build`
- `docker compose up`
- `docker compose config`

권장 prefix:

- `["docker", "compose"]`
- `["docker", "compose", "build"]`

### 파일/셸 조작

- `mv`
- `rm`
- `cp`
- `mkdir`

권장 prefix:

- `["mv"]`
- `["rm"]`
- `["cp"]`
- `["mkdir"]`

### 읽기/탐색 명령

- `sed -n`
- `find`
- `ls -la`
- `tail`
- `rg`

권장 prefix:

- `["sed", "-n"]`
- `["find"]`
- `["ls", "-la"]`
- `["tail"]`
- `["rg"]`

## 로컬 점검에 자주 쓰는 읽기 전용 명령

이 명령들은 보통 승인 없이도 충분한 경우가 많지만, 작업 흐름상 자주 사용됩니다.

- `sed -n`
- `find`
- `ls -la`
- `rg`
- `tail`

## 다른 프로젝트에서도 자주 쓰는 범용 prefix

아래는 프로젝트가 바뀌어도 자주 필요한 후보입니다.

### Git

- `["git", "add", "."]`
- `["git", "commit"]`
- `["git", "push", "origin"]`
- `["git", "pull"]`

### Docker

- `["docker", "compose"]`
- `["docker", "compose", "build"]`

### Shell file operations

- `["mv"]`
- `["rm"]`
- `["cp"]`
- `["mkdir"]`

### Read / inspection

- `["sed", "-n"]`
- `["find"]`
- `["ls", "-la"]`
- `["tail"]`
- `["rg"]`

### Node.js 계열

- `["npm", "install"]`
- `["npm", "run", "build"]`
- `["npm", "run", "test"]`
- `["pnpm", "install"]`
- `["pnpm", "build"]`
- `["pnpm", "test"]`

### Python 계열

- `["pytest"]`
- `["uv", "run"]`

## 권장 사용 방식

밤새 자동 진행을 원하면, 작업 시작 전에 아래 순서로 준비하는 것이 가장 현실적입니다.

1. 자주 쓸 prefix를 먼저 승인합니다.
2. 에이전트에게 중간 확인 없이 계속 진행하라고 지시합니다.
3. 새 prefix가 필요한 경우에만 그 시점에서 추가 승인합니다.

## 현재 세션에서 이미 승인된 prefix

- `["docker", "compose"]`
- `["docker", "compose", "build"]`
- `["git", "add", "."]`
- `["git", "push", "origin"]`

---
inclusion: always
---

# Local Runtime Validation

## Default Validation Environment
- Validate application changes in the local development environment only.
- Start the local stack with `docker compose up -d` before performing runtime verification.
- Use local Docker Compose status, logs, and localhost endpoints to verify behavior.
- Stop local services with `docker compose down` only when cleanup is needed or explicitly requested.

## Server Safety
- Never build, run, deploy, restart, or otherwise modify the application on an actual server.
- Do not use SSH, remote Docker commands, cloud build services, production CI/CD triggers, or any command targeting a non-local environment.
- Do not substitute server-side validation for local Docker Compose validation.
- If the user explicitly requests a real-server action, explain the impact and obtain explicit confirmation before taking any such action.

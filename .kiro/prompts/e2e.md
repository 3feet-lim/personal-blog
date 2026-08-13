# Headless E2E Test Execution

Run the headless browser end-to-end tests for this project, following these rules:

- Before the run, start the local application stack with `docker compose up -d` and target localhost endpoints only.
- Never target, build, deploy to, or access an actual server as part of E2E testing.
- Use the existing project E2E test command when available. If no E2E harness is configured, report that fact and ask before installing dependencies or creating test infrastructure.
- Report the executed command, test outcome, and any local cleanup performed.

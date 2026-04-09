# Project Instructions

## Communication
- Always respond to the user in Korean.
- Keep explanations concise, direct, and task-focused.
- Ask clarifying questions only when necessary to avoid risky assumptions.

## Instruction Language
- Write all agent instruction files in English.
- Write `AGENTS.md`, `AGENTS.override.md`, and any sub-agent specific guidance in English for maximum LLM clarity.
- User-facing responses must remain in Korean unless the user explicitly requests another language.

## Engineering Principles
- Follow SOLID principles regardless of programming language.
- Prefer clear separation of responsibilities and small composable units.
- Avoid unnecessary coupling, large god objects, and mixed concerns.
- Favor extensible designs when complexity is justified, but do not over-engineer.

## Coding Conventions
- Follow the standard conventions of the language, framework, and ecosystem used in each file.
- Match the existing repository style when a local convention already exists.
- Prefer idiomatic naming, structure, and error handling for the target language.
- Do not introduce stylistic patterns that conflict with established ecosystem norms.

## Change Scope
- Keep changes focused on the requested task.
- Avoid unrelated refactors unless they are required for correctness or maintainability.
- Do not add dependencies unless necessary and justified.

## Delivery Workflow
- For non-trivial tasks, do not start implementation immediately.
- First produce a short implementation spec covering scope, constraints, design, edge cases, and validation plan.
- Wait for explicit user approval before making code changes.
- Skip the spec-first step only when the user explicitly requests immediate implementation or the task is trivial.

## Quality
- Write code that is easy to read, test, and maintain.
- Add tests when the repository patterns and task scope justify them.
- Preserve backward compatibility unless the task explicitly allows breaking changes.

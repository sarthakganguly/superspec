# Agent Operating Guidelines

Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.

## Key Directives
- **Verification First**: Verify functionality with tests and type-checks (`docker compose exec backend python -m pytest`, `npm run build`, `npm run lint`).
- **No Suppressions**: Do not introduce `@ts-ignore`, `eslint-disable`, `# noqa`, or `# type: ignore` comments.
- **Traceability Integrity**: Ensure domain entities defined in Gate 2 are actively referenced in Gate 3 user stories.
- **Scope Discipline**: Only modify files within the scope of the assigned task.

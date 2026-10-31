# Constraints

Last reviewed: 2026-10-31 by @sarthakganguly

## Floor (always enforced, blocks mid-task)

- No new suppression comments: `@ts-ignore`, `eslint-disable`, `# noqa`, `# type: ignore`
- No unimplemented stubs: `throw new Error("Not implemented")`, empty `catch {}`, `raise NotImplementedError`
- No skipped or deleted tests without an explicit reason in the commit message
- No secrets in source (API tokens, private keys, embedded credentials)
- This file does not get weakened to make a change pass

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
|-----------|------|-----------|---------|
| Types (Frontend) | Zero type errors | `cd frontend && npm run build` (`tsc -b`) | edit loop, task end |
| Lint (Frontend) | Zero lint errors | `cd frontend && npm run lint` (`oxlint`) | edit loop, task end |
| Secrets | No secrets in source | `gitleaks detect --redact --no-banner` | task end, CI |
| Backend Unit Tests | 100% pass rate (zero failures) | `docker compose exec backend python -m pytest` | task end, CI |
| Coverage (Backend) | Changed lines ≥ 80% covered | `pytest --cov=. --cov-report=term-missing` + diff | task end, CI |
| Security: Code | No high/critical findings | `semgrep scan --config p/default` | CI |
| Security: Dependencies | Nothing at high or above | `osv-scanner scan source -r .` | CI |
| Accessibility | Zero critical or serious violations | `npx @axe-core/cli http://localhost:3002 --tags wcag2a,wcag2aa,wcag21aa` | preview / task end |
| Performance (Bundle) | Main JS bundle ≤ 400 kB uncompressed (≤ 120 kB gzipped) | `cd frontend && npm run build` | task end |
| Architecture | Zero illegal cross-layer imports (e.g. backend models importing from api) | `python -c "import sys; ..."` | task end, CI |

Every row names the command that produces the verdict. A dimension with a
number and no command in this column is an aspiration, not a constraint.

## Measured, not yet enforced (Ratchets)

| Metric | Today | Direction |
|--------|-------|-----------|
| Backend Test Suite Size | 42 passing tests | must not fall |
| Frontend JS Bundle Size | 368 kB (113 kB gzipped) | must not grow (> 5% drift) |
| Frontend CSS Bundle Size | 26.6 kB (5.7 kB gzipped) | must not grow |
| Frontend Oxlint Warnings | 5 warnings | must not grow; ratcheted downwards |

## Exceptions

| ID | Rule | Path | Reason | Owner | Expires |
|----|------|------|--------|-------|---------|
| W1 | `react/set-state-in-effect` | `frontend/src/hooks/useAuth.ts` | Asynchronous user profile fetching on token load | @team | 2026-12-01 |
| W2 | `react/set-state-in-effect` | `frontend/src/pages/Dashboard.tsx` | Initial project list fetching on mount | @team | 2026-12-01 |
| W3 | `react/set-state-in-effect` | `frontend/src/components/forms/Gate1Form.tsx` | Async artifact fetch on mount | @team | 2026-12-01 |

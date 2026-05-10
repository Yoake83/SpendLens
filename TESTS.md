# Tests

All tests live in `__tests__/audit-engine.test.ts` and use Vitest.

## How to run

```bash
npm test
# or watch mode:
npx vitest
```

## Test list

| # | Test name | File | What it covers |
|---|-----------|------|----------------|
| 1 | Returns zero savings when no tools provided | audit-engine.test.ts | Edge case: empty tool list; `isAlreadyOptimal` flag set correctly |
| 2 | Cursor Business downgrade for 2-person team | audit-engine.test.ts | Core rule: Business → Pro when seats ≤ 2; savings math ($40/mo) |
| 3 | GitHub Copilot Business downgrade for 3-person team | audit-engine.test.ts | Core rule: Business → Individual when seats ≤ 3; $27/mo savings |
| 4 | Claude Team downgrade for fewer than 5 seats | audit-engine.test.ts | Core rule: Team → Pro when seats < 5; $10/seat savings |
| 5 | Cursor Pro for coding team marked as use_credits | audit-engine.test.ts | True positive: correct plan not wrongly flagged as downgrade |
| 6 | highSavingsOpportunity flag set above $500/mo | audit-engine.test.ts | Credex CTA trigger logic; 50-seat enterprise scenario |
| 7 | Savings capped at current monthly spend | audit-engine.test.ts | Safety: cannot save more than you currently spend |
| 8 | GitHub Copilot flagged for non-coding use case | audit-engine.test.ts | Cross-tool recommendation: wrong tool for use case |
| 9 | Annual savings equals 12x monthly savings | audit-engine.test.ts | Arithmetic correctness of annual calculation |

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`.
The workflow runs: lint → typecheck → test.
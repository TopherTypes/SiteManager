# AGENTS.md — SiteManager Repository Instructions

These instructions apply to the entire repository tree rooted at this file.

## Purpose

This repository hosts a browser-based management simulation prototype. Agents should prioritize:

- deterministic behavior
- clear documentation
- minimal dependency footprint
- easy review and rollback

## Engineering Principles

1. Keep changes focused on the user-requested scope.
2. Avoid introducing frameworks/dependencies unless explicitly justified.
3. Favor readable vanilla JavaScript and modular separation.
4. Preserve clear boundaries between:
   - domain simulation logic
   - persistence/state concerns
   - rendering/UI concerns

## Documentation Expectations

When implementation changes affect behavior, update as needed:

- `README.md` (setup and usage)
- `SPEC.md` (requirements + technical behavior)
- `DECISIONS.md` (architecture and decision rationale)
- `CHANGELOG.md` (Keep a Changelog format)

## Versioning

- Follow Semantic Versioning.
- Maintain a `VERSION` file at repository root.
- Record every user-visible or architecture-relevant change in `CHANGELOG.md`.

## Code Quality

- Add comments only where they improve maintainability (why, constraints, assumptions).
- Avoid redundant comments that restate obvious code.
- Keep functions cohesive and reasonably small.
- Prefer pure functions in simulation logic.

## Validation

Before finalizing work, run available checks in this environment:

- formatting (if configured)
- linting (if configured)
- type checks (if configured)
- tests (if configured)
- lightweight runtime/build verification for changed code

If checks are missing, run best-effort validation and clearly report limitations.

## PR / Commit Hygiene

- Use clear, scoped commit messages.
- Summarize what changed, why, and any follow-up.
- Keep PR descriptions concise but complete.

## Documentation Requirements Checklist

Before finalizing any implementation work, verify:

- [ ] **JSDoc Comments**: All exported functions have JSDoc with @param and @returns
- [ ] **Inline Comments**: Complex formulas and non-obvious logic have explanatory comments
- [ ] **CHANGELOG.md**: Entry added for user-visible or architecture changes
- [ ] **DECISIONS.md**: Updated if an architecture decision was made
- [ ] **SPEC.md**: Updated if gameplay mechanics or behavior changed
- [ ] **README.md**: Updated if setup/usage instructions affected
- [ ] **Tests**: New simulation logic has >70% coverage (when testing infrastructure exists)
- [ ] **No Console Errors**: F12 console is clean, no warnings or errors
- [ ] **Determinism Verified**: Same action sequence produces identical outcome on replay

## Roadmap Engagement

Contributors may propose features for future phases:

1. **Open a GitHub issue** with `[feature-proposal]` label
2. **Include in proposal**:
   - Feature description and value to players
   - Estimated effort (S/M/L/XL)
   - Proposed phase (v0.2, v0.3, v1.0, or Future)
   - Any blocking dependencies
3. **Maintainer review**: Will evaluate fit against ROADMAP.md priorities
4. **Discussion**: Community can comment and provide feedback
5. **Acceptance**: If approved, added to roadmap and prioritized

See ROADMAP.md for current phase priorities and sequencing.

## Testing Standards

### Target Modules for Testing

**High Priority** (deterministic, formula-heavy):
- `src/sim.js` — Core simulation logic

**Medium Priority** (state management):
- `src/state.js` — Persistence and normalization edge cases

**Lower Priority** (UI/presentation):
- `src/ui.js`, `src/main.js` — Can be tested manually initially

### Test Framework

- **Tool**: Vitest (ES module native, low config)
- **Structure**: Tests in `src/__tests__/` directory
- **Naming**: `*.test.js` files
- **Coverage**: Aim for >80% on modified functions

### Example Test

```javascript
import { test, expect } from 'vitest';
import { simulateCycle } from '../sim.js';

test('deterministic RNG produces identical cycle outcomes from same seed', () => {
  const state = { /* ... initial state ... */ };
  const next1 = simulateCycle(state);
  const next2 = simulateCycle(state);

  expect(next1.anomaly.driftLevel).toBe(next2.anomaly.driftLevel);
  expect(next1.site.stability).toBe(next2.site.stability);
});
```

### CI/CD Testing

When GitHub Actions is configured:
- Tests run on every PR
- PRs cannot merge if tests fail
- Coverage reports available in PR checks

## Related Documentation

For detailed guidance, see:

- **CONTRIBUTING.md** — How to submit contributions (code style, PR process)
- **DEVELOPING.md** — Local setup and development tasks
- **ROADMAP.md** — Feature planning and phase priorities
- **API.md** — Complete module reference and formula documentation

# CONTRIBUTING.md — How to Contribute to SiteManager

Thank you for your interest in contributing! This guide explains our development philosophy, process, and standards.

---

## Philosophy

SiteManager is built on these principles:

1. **Determinism First**: All simulation outcomes must be reproducible from the same seed
2. **Clarity Over Cleverness**: Readable code beats concise code; explicit beats implicit
3. **Minimal Dependencies**: No frameworks, no build tools, no bloat (vanilla web stack)
4. **Quality Over Speed**: Deep iteration beats chasing features; we optimize for long-term maintainability
5. **Testability by Design**: Simulation logic must be testable in isolation from UI/persistence

These values guide code reviews, feature prioritization, and architectural decisions.

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/sitemanager.git
cd SiteManager
```

### 2. Create Feature Branch

```bash
git checkout -b feature/my-feature-name
```

Branch naming conventions:
- `feature/add-staff-fatigue` — new feature
- `bugfix/drift-calculation-off` — bug fix
- `docs/update-roadmap` — documentation
- `refactor/simplify-state-merge` — refactoring
- `test/add-simulation-tests` — test coverage

### 3. Make Your Changes

Follow the code style guide (below) and test locally (see DEVELOPING.md).

### 4. Commit & Push

```bash
git add src/sim.js CHANGELOG.md
git commit -m "feat: implement staff fatigue mechanics"
git push origin feature/staff-fatigue
```

See "Commit Message Format" section below.

### 5. Open Pull Request

On GitHub, create a PR:
- **Title**: Clear, concise summary (same as commit message subject)
- **Description**: Explain *why* this change, not just *what*
- **Link to issue**: If addressing a GitHub issue, reference it (#42)

**PR Checklist** (check these before submitting):
- [ ] Code follows style guide (see below)
- [ ] All exported functions have JSDoc with @param/@returns
- [ ] Complex formulas have inline comments
- [ ] Manual testing passed (see DEVELOPING.md)
- [ ] CHANGELOG.md entry added
- [ ] SPEC.md updated (if mechanics changed)
- [ ] DECISIONS.md updated (if architecture changed)
- [ ] No console errors or warnings
- [ ] Determinism verified (same actions → same outcome twice)

### 6. Respond to Review

Maintainers will review your code for:
- **Adherence to philosophy** (determinism, clarity, minimal deps)
- **Code quality** (style, testing, documentation)
- **Impact** (does it align with roadmap? any breaking changes?)

Respond to feedback promptly; be open to suggestions.

### 7. Merge & Celebrate

Once approved, your PR is merged. Watch for the next release where your work ships!

---

## Code Style Guide

### JavaScript Conventions

**Arrow Functions Preferred**

✅ Good:
```javascript
const double = (x) => x * 2;
const filter = (arr, fn) => arr.filter(fn);
export const isStable = (stability) => stability > 60;
```

❌ Avoid:
```javascript
function double(x) { return x * 2; }
const isStable = function(stability) { return stability > 60; };
```

**Exception**: Use function keyword if you need `this` binding (rare in this codebase).

---

**Immutable State Updates**

✅ Good:
```javascript
const updated = {
  ...staff,
  stress: clamp(staff.stress + 5)
};

const newArray = [
  ...oldArray,
  { id: 'new', value: 42 }
];
```

❌ Avoid:
```javascript
staff.stress += 5;  // Mutation (breaks determinism)
oldArray.push({ id: 'new', value: 42 });  // Mutation
```

---

**Naming Conventions**

Variables and functions: `camelCase`
```javascript
const knowledgeDelta = 5;
const getStaffById = (id) => staff.find(s => s.id === id);
export function simulateCycle(state) { /* ... */ }
```

Constants: `SCREAMING_SNAKE_CASE`
```javascript
const KNOWLEDGE_COMPETENCE_DIVISOR = 18;
const ACTION_LIMIT_PER_CYCLE = 3;
const STRESS_THRESHOLD_HIGH = 70;
```

---

**Pure Functions in Simulation Logic**

Simulation functions must avoid side effects (mutations, external I/O).

✅ Good:
```javascript
function resolveExperiment(state, rng) {
  // No mutations; returns new values
  return {
    knowledgeDelta,
    driftDelta,
    /* ... */
  };
}
```

❌ Avoid:
```javascript
function resolveExperiment(state, rng) {
  // BAD: Mutates state directly
  state.anomaly.driftLevel += driftDelta;
  state.anomaly.knowledgeGained += knowledgeDelta;
}
```

---

**Comments: Why, Not What**

Good comments explain non-obvious logic, assumptions, or design decisions.

✅ Good:
```javascript
// Divisor 18 scales researcher competence (60-76 range) to knowledge gain of 3-4 per cycle
const knowledgeDelta = Math.round((lead.competence / 18) * intensityFactor + noise);

// Safeguards apply multiplier to reduce drift: minimal=1.25 (risky), standard=1.0, reinforced=0.72
const driftDelta = baseDrift * safeguardFactor;

// Caution reduces stress: each 65 points of caution offsets 1 stress point
const stressDelta = baseStress - (lead.caution / 65);
```

❌ Avoid:
```javascript
// Increment x by 1
x += 1;

// Set isActive to true
isActive = true;

// Calculate the knowledge delta
const knowledgeDelta = /* ... */;
```

---

**JSDoc Format**

All exported functions must have JSDoc with @param and @returns:

```javascript
/**
 * Brief description of what this function does (1-2 sentences).
 *
 * Additional context if needed (why it exists, key assumptions).
 *
 * @param {type} paramName - What this parameter is/does
 * @param {type} otherParam - Another parameter
 * @returns {type} What the function returns
 */
export function myFunction(paramName, otherParam) {
  // implementation
}
```

**Example**:
```javascript
/**
 * Resolve experiment action: calculate knowledge, drift, strain, and stress deltas.
 *
 * The experiment outcome depends on lead researcher competence, experiment intensity,
 * and safeguard level. High intensity + minimal safeguards = high knowledge + high risk.
 *
 * @param {object} state - Current game state
 * @param {object} rng - Seeded RNG function for deterministic randomness
 * @returns {object} Deltas: {knowledgeDelta, driftDelta, strainDelta, stressDelta, summary}
 */
export function resolveExperiment(state, rng) {
  // implementation
}
```

---

## Commit Message Format

Use conventional commit format for clarity and automatic changelog generation:

```
<type>: <subject>

<body>

Example:

feat: implement staff fatigue mechanics

- Stress > 70 reduces competence by 15
- Fatigue affects experiment knowledge gain
- Staff recovery mechanic: lower stress when reassigned to lighter roles
- UI shows competence penalty in staff list

Fixes #42
```

**Types** (pick one):
- `feat:` — New feature or functionality
- `fix:` — Bug fix
- `docs:` — Documentation changes (README, guides, comments)
- `refactor:` — Code restructuring (no feature change)
- `test:` — Adding or updating tests
- `style:` — Code style (formatting, naming)
- `perf:` — Performance improvement
- `chore:` — Build/tooling/dependency changes

**Subject**:
- Imperative mood ("add", not "added" or "adds")
- Lowercase (except proper nouns)
- No period at end
- Under 50 characters

**Body** (optional but recommended):
- Explain *why* this change (not *what* — code shows that)
- Bullet points for multiple changes
- Wrap at 72 characters
- Reference issues: `Fixes #123`, `Relates to #456`

---

## Documentation Requirements

### When to Update Documentation

| Change Type | Update |
|-------------|--------|
| New feature | README.md, CHANGELOG.md, SPEC.md (if mechanics), API.md |
| Bug fix | CHANGELOG.md (if user-visible) |
| Code refactor | DECISIONS.md (if architecture decision), DEVELOPING.md (if process changed) |
| New formula | API.md (formula table), SPEC.md (if gameplay-changing) |
| Any exported function | JSDoc header + inline comments |

### CHANGELOG.md Format

Add entry under the appropriate version section using Keep a Changelog format:

```markdown
## [Unreleased]

### Added
- Staff fatigue mechanics: stress >70 reduces competence
- New UI shows competence penalties

### Changed
- Formula: competence divisor adjusted from 16 to 18

### Fixed
- Bug: drift calculation off by 0.5 on high-intensity experiments
```

### DECISIONS.md Format

If your change involves an architectural decision, add an entry:

```markdown
## D-006: Staff Competence Degradation on High Stress

- **Date**: 2026-04-15
- **Status**: Accepted
- **Decision**: Implement fatigue mechanic where stress > 70 reduces competence by 15
- **Why**: Creates meaningful trade-off between pushing hard and protecting staff; increases replayability
- **Trade-off**: Adds complexity to staff management; requires new UI indicator
- **Review Date**: 2026-09-15 (after player feedback on difficulty)
```

---

## Testing Expectations

### Manual Testing (Always Required)

Before submitting a PR, test locally:

1. **No console errors** — F12 → Console, verify clean
2. **Page loads** — UI renders, no blank screen
3. **Actions work**:
   - Form inputs update state
   - "Commit Cycle" advances cycle counter
   - "Reset Save" clears game
4. **Metrics update** — Values change after cycles
5. **Persistence** — State survives page reload
6. **Determinism** — Same actions twice = same outcome (core requirement!)

See DEVELOPING.md for detailed manual testing checklist.

### Unit Tests (For v0.2.0+)

New simulation logic should include unit tests targeting core functions.

Target: >70% coverage for modified code

Example test structure:
```javascript
import { test, expect } from 'vitest';
import { simulateCycle } from './sim.js';
import { DEFAULT_STATE } from './data.js';

test('high-intensity experiment produces expected knowledge range', () => {
  const state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  state.pendingActions.experiment.intensity = 'high';
  state.pendingActions.experiment.safeguards = 'standard';

  const next = simulateCycle(state);
  const knowledgeGain = next.anomaly.knowledgeGained - state.anomaly.knowledgeGained;

  // High intensity should produce more knowledge than medium
  expect(knowledgeGain).toBeGreaterThan(3);
  expect(knowledgeGain).toBeLessThan(8);
});
```

---

## Code Review Checklist

When reviewing PRs, maintainers check:

- ✅ **Philosophy alignment**: Deterministic? Clear? Minimal deps?
- ✅ **Code style**: Follows conventions above?
- ✅ **Testing**: Manual tests passed? Tests added for complex logic?
- ✅ **Documentation**: JSDoc complete? Comments explain non-obvious logic? CHANGELOG updated?
- ✅ **No breaking changes**: Backwards compatible?
- ✅ **Roadmap fit**: Does this align with ROADMAP.md priorities?

Feedback focuses on helping you improve; be collaborative!

---

## Reporting Issues

Found a bug or have an idea?

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with appropriate label:
   - `[bug]` — Something broken
   - `[feature-request]` — New capability
   - `[question]` — Need clarification
   - `[discussion]` — Open-ended topic

3. **For bugs**, include:
   - Reproduction steps (cycle number, actions taken)
   - Expected behavior
   - Actual behavior
   - Browser/OS (if relevant)

4. **For features**, include:
   - Use case (why this matters)
   - Proposed solution (if you have ideas)
   - Roadmap alignment (which phase?)

---

## Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project (currently: LICENSE file).

---

## Questions?

- **How do I run tests?** — See DEVELOPING.md
- **Where's the formula logic?** — `src/sim.js`; reference API.md for details
- **How do I add a new anomaly?** — See DEVELOPING.md "Task 1"
- **What's the roadmap?** — See ROADMAP.md for v0.2-v1.0+ plans
- **How do I debug determinism issues?** — See DEVELOPING.md "Debugging Tips"

Open a GitHub issue labeled `[question]` if stuck!

---

## Contributor Covenant

We are committed to providing a welcoming and inclusive environment. Please see our CODE_OF_CONDUCT (TBD) for expectations.

---

**Thank you for contributing to SiteManager!** 🎉

Every PR, issue, and piece of feedback makes this project better. We appreciate your time and effort.

Happy hacking! 🚀

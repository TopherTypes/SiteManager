# DEVELOPING.md — SiteManager Developer Guide

This guide covers local setup, development patterns, and common tasks for extending SiteManager.

---

## Local Setup

### Prerequisites
- **Browser**: Modern browser with ES6 module support (Chrome 61+, Firefox 67+, Safari 10.1+)
- **Editor**: Any text editor (VSCode, Sublime, Vim, etc.)
- **Git**: For cloning and version control
- **Node.js** (optional): For running local dev server, linting, tests

### Running Locally

#### Option 1: Direct (No Server)
```bash
# Clone the repository
git clone https://github.com/tophertypes/sitemanager.git
cd SiteManager

# Open in browser
open index.html
```

**Note**: Some browsers enforce stricter module loading for `file://` URLs. If you see "CORS error" or "Cross-Origin request blocked", use Option 2.

#### Option 2: Local Dev Server (Recommended)

**Python 3**:
```bash
python -m http.server 8000
# Navigate to: http://localhost:8000
```

**Node.js / npm** (if you have it):
```bash
npx http-server -p 8000
# Navigate to: http://localhost:8000
```

### Verifying Setup

1. Open dev tools (F12 or Cmd+Option+J)
2. Check **Console** tab — should show no errors
3. Click **Commit Cycle** button — should advance cycle counter
4. Check **Application > Storage > Local Storage** — should see `site-director-mvp-state-v0` key with game state

---

## Project Anatomy

### File Organization
```
src/
├── main.js           # Bootstrap + event wiring (entry point)
├── state.js          # Persistence & state normalization
├── sim.js            # Simulation engine (core logic)
├── ui.js             # Rendering & DOM updates
├── data.js           # Constants, staff roster, defaults
├── utils/
│   └── rng.js        # Seeded RNG (Mulberry32)
└── styles.css        # Layout & styling
```

### Dependency Graph
```
index.html
  └─ main.js (orchestrator)
      ├─ state.js (load/save)
      ├─ sim.js (simulate one cycle)
      ├─ ui.js (render all panels)
      └─ data.js (constants)
```

### When to Touch Which File

| Task | File(s) |
|------|---------|
| **Add a new anomaly** | `src/data.js` (DEFAULT_STATE, anomaly properties) |
| **Change staff roster** | `src/data.js` (STAFF_BASE) |
| **Add new action type** | `src/sim.js` (new function) + `src/data.js` (new constants) + `src/ui.js` (new form) |
| **Change formula logic** | `src/sim.js` (formula functions) |
| **Update UI layout** | `src/ui.js` (render functions) or `src/styles.css` (styling) |
| **Add persistence** | `src/state.js` (DEFAULT_STATE shape) |
| **Change event handling** | `src/main.js` (event listeners) |

---

## Common Development Tasks

### Task 1: Add a New Anomaly Profile

**Goal**: Add a second anomaly type so players see variety.

**Steps**:

1. **Edit `src/data.js`** — Add to DEFAULT_STATE:
```javascript
anomaly: {
  id: 'A-02',
  title: 'Resonance Cascade',
  driftLevel: 22,  // Different baseline
  containmentStrain: 25,
  observationPressure: 8,
  knowledgeGained: 0
}
```

2. **Update CHANGELOG.md** — Add entry under v0.2.0:
```
- Add second anomaly profile: Resonance Cascade (A-02)
```

3. **Test**:
   - Open game, verify anomaly displays correctly
   - Commit cycles, verify metrics change as expected
   - Compare against A-01 — ensure different behavior

### Task 2: Implement Staff Fatigue (Complex Example)

**Goal**: Make stress affect staff competence (Phase 1 roadmap item).

**Changes**:

1. **Edit `src/sim.js`** — Modify `simulateCycle()`:
```javascript
// Add before stress updates
next.staff = next.staff.map((member) => {
  const stressCompetencePenalty = member.stress > 70 ? -15 : member.stress > 35 ? -5 : 0;
  return {
    ...member,
    competence: Math.max(20, member.competence + stressCompetencePenalty)
  };
});
```

2. **Edit `src/sim.js`** — Modify `resolveExperiment()` to account for fatigue:
```javascript
// Change competence-based knowledge calc to use actual (possibly reduced) competence
const effectiveCompetence = lead.competence; // Already reflects stress penalty from above
const knowledgeDelta = Math.round((effectiveCompetence / 18) * intensityFactor + randomRange(rng, 0, 2));
```

3. **Edit `src/ui.js`** — Show competence reduction in staff list (add to renderUI):
```javascript
// In action card, show: "Dr. Vale (76 competence, stress 85, -15 penalty)"
```

4. **Update CHANGELOG.md**:
```
- Implement staff fatigue: high stress (>70) reduces competence by 15
```

5. **Test**:
   - Run high-intensity experiment with lead researcher
   - Verify lead stress increases
   - Verify subsequent experiment with same lead shows reduced knowledge gain
   - Try reassigning staff to low-stress roles and check recovery

### Task 3: Add a New Protocol Mode

**Goal**: Expand protocol options (e.g., "Emergency Shutdown" mode).

**Steps**:

1. **Edit `src/data.js`** — Add to PROTOCOL_MODES:
```javascript
export const PROTOCOL_MODES = [
  'balanced',
  'tighten-containment',
  'reduce-power',
  'restrict-access',
  'emergency-shutdown'  // NEW
];
```

2. **Edit `src/sim.js`** — Add case in `applyProtocol()`:
```javascript
case 'emergency-shutdown':
  return {
    stability: 6,        // Major stability boost
    power: -8,           // Extreme power loss
    strain: -3,          // Reduces anomaly strain
    knowledgePenalty: -4, // Research halted
    note: 'Full containment lockdown initiated—facility offline.'
  };
```

3. **Edit `src/ui.js`** — Form will auto-update (it reads from PROTOCOL_MODES constant)

4. **Test**:
   - Open game, select "Emergency Shutdown" from protocol dropdown
   - Commit cycle
   - Verify stability increases, power drops significantly
   - Check reports mention shutdown

### Task 4: Extend Simulation Logging

**Goal**: Debug why certain cycles produce unexpected outcomes.

**Steps**:

1. **In browser DevTools console**, inspect state:
```javascript
// Load current state from localStorage
const stored = localStorage.getItem('site-director-mvp-state-v0');
const state = JSON.parse(stored);
console.log(state.site.containmentStability);  // Check stability
console.log(state.staff[0].stress);            // Check lead stress
```

2. **Replay a specific cycle** (since RNG is seeded):
```javascript
// In main.js, temporarily add logging before simulateCycle:
state = simulateCycle(state);
console.log('After cycle:', state.site.containmentStability);
```

3. **Verify determinism**:
   - Reset game (Reset Save button)
   - Commit exact same sequence of actions twice
   - Check that cycle outcomes are identical

---

## Testing Locally

### Manual Testing Checklist

Before committing changes, verify:

- [ ] **No console errors** (F12 → Console tab)
- [ ] **Page loads** in browser without blank screen
- [ ] **State loads** — cycle counter visible and >0
- [ ] **Actions work**:
  - [ ] Form inputs update pending actions
  - [ ] "Commit Cycle" advances cycle counter
  - [ ] "Reset Save" clears and restarts game
- [ ] **Metrics update** — stability, drift, stress change after cycle
- [ ] **Reports appear** — new reports in feed after each cycle
- [ ] **localStorage persists** — game state survives page reload
- [ ] **Determinism** — same action sequence produces identical outcome twice

### Running Automated Tests (v0.2.0+)

Once test infrastructure is in place:
```bash
npm install --save-dev vitest
npm run test
```

This runs the test suite in `src/__tests__/` directory.

---

## Git Workflow

### Branch Naming
```
feature/add-staff-fatigue
bugfix/drift-calculation-off
docs/update-roadmap
```

### Commit Message Format
```
<type>: <subject>

<body>

Example:
feat: implement staff fatigue mechanics

- Stress >70 reduces competence by 15
- Fatigue affects experiment outcomes
- New UI shows competence penalties
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Before Pushing
1. **Test locally** (manual checklist above)
2. **Update CHANGELOG.md** with your change
3. **Update relevant docs** (SPEC.md if mechanics change, README if user-facing)
4. **Commit with clear message**

```bash
git add src/sim.js CHANGELOG.md
git commit -m "feat: add staff fatigue based on stress level"
git push origin feature/staff-fatigue
```

---

## Code Style Guide

### JavaScript Conventions

**Arrow functions preferred** over `function` keyword:
```javascript
// ✅ Good
const double = (x) => x * 2;
const map = (arr, fn) => arr.map(fn);

// ❌ Avoid (except for `this` binding cases)
function double(x) { return x * 2; }
```

**Immutable state updates** (use spread operator):
```javascript
// ✅ Good
const updated = {
  ...staff,
  stress: clamp(staff.stress + 5)
};

// ❌ Avoid
staff.stress += 5;  // Mutation
```

**Naming conventions**:
```javascript
// variables/functions: camelCase
const knowledgeDelta = 5;
const calculateDrift = (state) => { /* ... */ };

// constants: SCREAMING_SNAKE_CASE
const KNOWLEDGE_COMPETENCE_DIVISOR = 18;
const ACTION_LIMIT_PER_CYCLE = 3;
```

**Pure functions in simulation logic** (avoid side effects):
```javascript
// ✅ Good (pure)
function resolveExperiment(state, rng) {
  return { knowledgeDelta, driftDelta, /* ... */ };
}

// ❌ Avoid (side effect)
function resolveExperiment(state, rng) {
  state.anomaly.driftLevel += drift;  // Mutation!
  return deltas;
}
```

---

## Documentation Expectations

### When to Add Comments

**Good reasons to comment**:
- Explain non-obvious formulas ("divisor 18 scales researcher competence 60-76 to 3-4 knowledge/cycle")
- Document assumptions ("assumes staff array is non-empty; returns first staff as fallback")
- Reference decisions ("see DECISIONS.md D-002 for determinism justification")

**Poor reasons** (avoid):
- Restating obvious code ("increment i by 1" for `i += 1`)
- Comments that duplicate variable names ("staff count" for `staffCount`)

### JSDoc Template

```javascript
/**
 * Brief description (1-2 sentences).
 *
 * Additional context if needed (why this function exists, assumptions).
 *
 * @param {type} name - description
 * @param {type} name2 - description
 * @returns {type} What the function returns
 */
export function myFunction(name, name2) {
  // implementation
}
```

---

## Debugging Tips

### Console Tricks

**Inspect game state**:
```javascript
// In console:
const state = JSON.parse(localStorage.getItem('site-director-mvp-state-v0'));
state.anomaly.driftLevel  // 42.5
state.staff[0].stress      // 72
```

**Replay a specific cycle** (pseudo-code):
```javascript
// Manually call simulateCycle with known state
import { simulateCycle } from './src/sim.js';
const state = JSON.parse(localStorage.getItem('site-director-mvp-state-v0'));
const next = simulateCycle(state);
console.log(next.site.containmentStability);  // See results before saving
```

**Check RNG determinism**:
```javascript
import { createRng, randomRange } from './src/utils/rng.js';
const rng = createRng(130021 + 5);  // Cycle 5
console.log(randomRange(rng, 0, 10));  // Should be reproducible
```

---

## Performance Debugging

If the game feels slow:

1. **Open DevTools → Performance tab**
2. **Record** a single cycle commit
3. **Look for**:
   - Long-running functions (anything > 50ms)
   - Excessive DOM reflows (red bars)
4. **Profile** with `console.time()`:
```javascript
console.time('simulateCycle');
state = simulateCycle(state);
console.timeEnd('simulateCycle');
```

---

## Submission Checklist

Before opening a PR:

- [ ] Code follows style guide (camelCase, pure functions, immutable updates)
- [ ] All exported functions have JSDoc
- [ ] Complex logic has inline comments
- [ ] No console errors or warnings
- [ ] Manual testing passed (checklist above)
- [ ] CHANGELOG.md updated with your change
- [ ] Relevant docs updated (README, SPEC, DECISIONS if applicable)
- [ ] Git commits are clear and focused
- [ ] No large refactoring mixed with feature changes

---

## Getting Help

- **General questions**: Open a GitHub issue with `[question]` tag
- **Bug report**: Issue with `[bug]` tag, include: reproduction steps, expected behavior, actual behavior
- **Feature ideas**: Issue with `[feature-proposal]` tag, reference ROADMAP.md
- **Architecture questions**: See DECISIONS.md or ask on issue

---

## Next Steps After Implementing

1. **Test thoroughly** (see checklist)
2. **Commit with message** describing what changed and why
3. **Update documentation**:
   - CHANGELOG.md (what users need to know)
   - SPEC.md or DECISIONS.md (if architecture changed)
   - Inline JSDoc (if adding functions)
4. **Open PR** with description of changes
5. **Respond to review feedback** and iterate

Happy developing! 🚀

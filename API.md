# API.md — SiteManager Module Reference & Formulas

Complete reference for all exported functions, state shape, and simulation formulas.

---

## Module Reference

### `src/utils/rng.js` — Deterministic Random Number Generation

**Purpose**: Seed-based PRNG using Mulberry32 algorithm for deterministic, reproducible randomness.

#### Exported Functions

```javascript
/**
 * Create a deterministic RNG function with given seed.
 *
 * @param {number} seed - Seed value (any integer)
 * @returns {function} RNG function that returns [0, 1) float on each call
 */
export function createRng(seed)
```

**Example**:
```javascript
const rng = createRng(130021);
const val1 = rng();  // Returns same value every time with same seed
const val2 = rng();  // Next value in sequence
```

```javascript
/**
 * Generate random float in range [min, max).
 *
 * @param {function} rng - RNG function from createRng()
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Float in range [min, max)
 */
export function randomRange(rng, min, max)
```

**Example**:
```javascript
const noise = randomRange(rng, -2, 2);  // Returns value in [-2, 2)
```

```javascript
/**
 * Generate random integer in range [min, max] (both inclusive).
 *
 * @param {function} rng - RNG function from createRng()
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Integer in range [min, max]
 */
export function randomInt(rng, min, max)
```

**Example**:
```javascript
const staffIndex = randomInt(rng, 0, 4);  // Returns 0-4 inclusive
```

---

### `src/data.js` — Constants & Configuration

**Purpose**: Single source of truth for game configuration, staff roster, action definitions, and default state.

#### Exported Constants

```javascript
// Storage key for localStorage
export const STORAGE_KEY = 'site-director-mvp-state-v0';

// Action budget per cycle
export const ACTION_LIMIT_PER_CYCLE = 3;

// Default RNG seed (for new games)
export const DEFAULT_SEED = 130021;

// Available staff roles
export const ROLES = ['research', 'security', 'engineering'];

// Experiment intensity levels (determine drift/knowledge/stress multipliers)
export const EXPERIMENT_INTENSITY = ['low', 'medium', 'high'];

// Safeguard levels (determine risk/reward trade-off)
export const SAFEGUARDS = ['minimal', 'standard', 'reinforced'];

// Protocol modes (adjust containment posture)
export const PROTOCOL_MODES = ['balanced', 'tighten-containment', 'reduce-power', 'restrict-access'];
```

#### Initial Staff Roster

```javascript
export const STAFF_BASE = [
  { id: 's-1', name: 'Dr. Vale', role: 'research', competence: 76, caution: 58, stress: 22 },
  { id: 's-2', name: 'Dr. Morrow', role: 'research', competence: 69, caution: 72, stress: 26 },
  { id: 's-3', name: 'Lt. Harker', role: 'security', competence: 67, caution: 81, stress: 20 },
  { id: 's-4', name: 'Officer Imani', role: 'security', competence: 61, caution: 74, stress: 18 },
  { id: 's-5', name: 'Eng. Cho', role: 'engineering', competence: 73, caution: 64, stress: 24 }
];
```

**Staff Attributes**:
- **competence (0-100)**: Ability at current role; affects experiment knowledge gain
- **caution (0-100)**: Risk aversion; reduces stress and drift deltas
- **stress (0-100)**: Fatigue level; increases with high-intensity actions; degrades performance

#### Default State Shape

```javascript
export const DEFAULT_STATE = {
  meta: {
    version: '0.1.0',      // Semantic version
    seed: 130021,          // RNG seed for deterministic replay
    cycle: 0               // Current cycle number (starts at 0)
  },
  site: {
    containmentStability: 83,      // 0-100; facility structural integrity
    powerLoad: 54,                 // 0-100; power consumption level
    containmentIntegrity: 87       // 0-100; containment system condition
  },
  anomaly: {
    id: 'A-01',
    title: 'The Discrepancy Field',
    driftLevel: 16,                // 0-100; anomaly instability
    containmentStrain: 18,         // 0-100; stress on containment
    observationPressure: 12,       // 0-100; difficulty observing anomaly
    knowledgeGained: 0             // Cumulative research progress
  },
  staff: [/* ... STAFF_BASE ... */],  // Current staff roster (may differ from STAFF_BASE)
  reports: [/* ... */],                // History of cycle reports
  pendingActions: {
    experiment: { leadId, intensity, safeguards },
    reassignment: { staffId, targetRole },
    protocol: { mode },
    clarification: { enabled }
  }
}
```

---

### `src/state.js` — Persistence & State Normalization

**Purpose**: Load, save, and normalize game state from/to browser localStorage with defensive recovery.

#### Exported Functions

```javascript
/**
 * Load game state from localStorage.
 * Returns fresh default state if localStorage empty or corrupted.
 * Normalizes state to ensure compatibility.
 *
 * @returns {object} Complete, normalized game state
 */
export function loadState()
```

```javascript
/**
 * Persist game state to localStorage.
 *
 * @param {object} state - Complete game state
 */
export function saveState(state)
```

```javascript
/**
 * Clear localStorage and return fresh default state.
 *
 * @returns {object} Fresh default state (same as initial game setup)
 */
export function resetState()
```

**Usage Example**:
```javascript
import { loadState, saveState, resetState } from './state.js';

const state = loadState();              // Load saved or default
state.site.powerLoad = 60;              // Modify
saveState(state);                       // Persist
const fresh = resetState();             // Clear and get fresh start
```

---

### `src/sim.js` — Deterministic Cycle Simulation

**Purpose**: Core simulation engine that resolves all pending actions in a single cycle, updating all game metrics deterministically.

#### Exported Functions

```javascript
/**
 * Main simulation function: resolve all pending actions and advance one cycle.
 *
 * Pipeline:
 * 1. Resolve experiment (knowledge, drift, strain, stress)
 * 2. Apply protocol mode effects
 * 3. Apply staff reassignments
 * 4. Calculate composite effects (role balance, instability)
 * 5. Update all metrics with clamping [0, 100]
 * 6. Apply staff-wide stress changes
 * 7. Generate contextual reports
 *
 * All randomness uses seeded RNG for deterministic replay.
 *
 * @param {object} state - Current game state
 * @returns {object} New state with cycle incremented and all metrics updated
 */
export function simulateCycle(state)
```

#### Formula Reference

All formulas operate on normalized values (0-100 range). Output deltas are clamped to prevent overflow.

##### Experiment Outcomes

**Knowledge Gain** (KP per cycle):
```
knowledgeDelta = floor((lead_competence / 18) × intensity_factor + noise)
- Divisor 18: scales 60-76 researcher competence to 3-4 KP per medium-intensity cycle
- intensity_factor: low=0.6, medium=1.0, high=1.45
- noise: random [0, 2)
- Range: 2-8 KP typical (higher competence + higher intensity → more knowledge)
```

**Drift Delta** (anomaly instability increase):
```
driftDelta = (4 + intensity_factor × 6 + noise) × safeguard_factor
- Base 4 drift per cycle (constant instability gain)
- intensity_factor: low=0.6, medium=1.0, high=1.45
- safeguard_factor: minimal=1.25, standard=1.0, reinforced=0.72
- noise: random [0, 2)
- Range: 2-12 per cycle (high-intensity, minimal safeguards → max drift)
```

**Strain Delta** (containment system stress):
```
strainDelta = (3 + intensity_factor × 4 + noise) × safeguard_factor
- Base 3 strain per cycle
- intensity_factor: low=0.6, medium=1.0, high=1.45
- safeguard_factor: minimal=1.25, standard=1.0, reinforced=0.72
- noise: random [0, 1.2)
- Range: 1-9 per cycle (similar scaling to drift, slightly less)
```

**Stress Delta** (lead researcher fatigue):
```
stressDelta = floor(2 + intensity_factor × 2.5 - (lead_caution / 65) + noise)
- Base 2 stress per experiment
- intensity_factor: low=0.6, medium=1.0, high=1.45
- caution modifier: -0.6 to +1.2 (caution 40 → +0.38; caution 80 → -0.23)
- noise: random [0, 2)
- Range: 0-7 (high-caution staff can avoid stress; low-caution staff accumulate)
```

##### Protocol Mode Effects

| Mode | Stability | Power | Strain | Knowledge | Use Case |
|------|-----------|-------|--------|-----------|----------|
| **balanced** | +0 | +0 | +0 | +0 | Neutral (baseline) |
| **tighten-containment** | +4 | +5 | -2 | -2 | Maximum safety investment |
| **reduce-power** | -3 | -6 | +2 | -1 | Cost-saving mode |
| **restrict-access** | +2 | +1 | +1 | -3 | Moderate safety, research penalty |

##### Containment Stability Calculation

```
next_stability = clamp(
  current_stability
  + protocol_effect
  - (driftPressure × 0.18)
  - baseInstability
  + clarityBonus × 0.4
)
- driftPressure: experiment drift + (max(0, research_count - security_count) × 0.7)
- baseInstability: random [-1.2, 1.8) (chaos in anomaly)
- clarityBonus: 3 if clarification enabled, else 0
```

##### Power Load Calculation

```
next_powerLoad = clamp(
  current_power
  + protocol_effect
  + (driftDelta × 0.12)
  + random(-1, 1)
)
- Protocol power adjustments: tighten=+5, reduce=-6, restrict=+1
- Drift drives power: higher instability → more power consumption
```

##### Containment Integrity Calculation

```
next_integrity = clamp(
  current_integrity
  - (strainDelta × 0.22)
  - max(0, driftLevel - 65) × 0.04
)
- Strain erodes integrity: 0.22 multiplier
- High drift (> 65) adds penalty: 0.04 per point above threshold
```

##### Drift Level Calculation

```
next_driftLevel = clamp(
  current_drift
  + driftDelta
  - clarityBonus × 0.7
)
- Experiments increase drift directly
- Clarification requests reduce drift (0.7 multiplier on 3-point bonus)
```

##### Staff-Wide Stress

```
for each staff member:
  if member is lead researcher:
    stress += experimentOutcome.stressDelta
  stress += random(0, supportStressDelta)
- supportStressDelta: 1 if clarification enabled, else 2
- All staff accumulate background stress (representing fatigue from cycle activity)
```

---

### `src/ui.js` — Rendering & User Interface

**Purpose**: Render all DOM elements, apply information obscuration, and display player-facing metrics with noise based on drift.

#### Exported Functions

```javascript
/**
 * Main render entry point: update all UI elements with current state.
 * Called after every state change (input, cycle commit, reset).
 * Re-renders all three panels: reports (left), status (center), actions (right).
 *
 * @param {object} state - Current game state
 */
export function renderUI(state)
```

#### Rendering Pipeline

1. **renderTopMetrics()** — Cycle counter, stability, power, avg stress, research progress
   - Applies drift-based noise: `approxNoise = driftLevel / 18`
   - Each metric rounds with noise to simulate observation inaccuracy

2. **renderReports()** — Last 16 reports in reverse chronological order
   - Shows cycle number, source (Research/Security/Engineering), and text
   - Oldest reports scroll off history (max 60 stored in state)

3. **renderCenterStatus()** — Anomaly info, risk badge, metrics
   - Displays: anomaly ID/title, drift, strain, pressure, integrity
   - Risk badge triggers if:
     - Stability < 40%, OR
     - Integrity < 45%, OR
     - Drift > 70

4. **renderUI() body** — Action forms
   - Dynamically generates dropdowns from constants (EXPERIMENT_INTENSITY, SAFEGUARDS, etc.)
   - Pre-selects current pending action values
   - Updates action summary counter (e.g., "Selected actions: 2/3")

#### Information Obscuration

**Philosophy**: High drift → unreliable observations. Player sees noisy approximations of true values.

```javascript
const approxNoise = state.anomaly.driftLevel / 18;
// driftLevel 36 → noise ±2%
// driftLevel 54 → noise ±3%
// driftLevel 90 → noise ±5%

const displayed = percentWithNoise(trueValue, approxNoise);
// trueValue 60 + noise ±2 → displays "58%", "62%", or "59%"
```

#### Risk Assessment Thresholds

```javascript
const critical =
  stability < 40 ||          // Facility losing structural integrity
  integrity < 45 ||          // Containment systems failing
  driftLevel > 70;           // Anomaly becoming unstable

// Critical: red "Critical risk trend" badge
// Safe: green "Contained (watchlist)" badge
```

---

### `src/main.js` — Application Bootstrap & Event Orchestration

**Purpose**: Load initial state, bind form inputs to state, and orchestrate the simulation → render → save pipeline.

#### Event Flow

```
User opens page
  ↓
main.js: loadState() → initialize state from localStorage
  ↓
main.js: rerenderAndBind() → render UI and attach event listeners
  ↓
User clicks form input
  ↓
Listener fires: syncPendingFromDom() → saveState() → renderUI()
  ↓
User clicks "Commit Cycle"
  ↓
Listener fires: syncPendingFromDom() → simulateCycle() → saveState() → rerenderAndBind()
  ↓
State persists in localStorage, UI updates
  ↓
Cycle counter increments, metrics change, new reports appear
```

---

## State Shape Diagram

```
state
├── meta
│   ├── version: "0.1.0"
│   ├── seed: 130021
│   └── cycle: 5
├── site
│   ├── containmentStability: 78.5
│   ├── powerLoad: 61.2
│   └── containmentIntegrity: 81.3
├── anomaly
│   ├── id: "A-01"
│   ├── title: "The Discrepancy Field"
│   ├── driftLevel: 24.5
│   ├── containmentStrain: 31.2
│   ├── observationPressure: 18.5
│   └── knowledgeGained: 12
├── staff: [
│   {
│     id: "s-1",
│     name: "Dr. Vale",
│     role: "research",
│     competence: 76,
│     caution: 58,
│     stress: 38
│   },
│   // ... 4 more staff
│ ]
├── reports: [
│   {
│     cycle: 0,
│     source: "System Intake",
│     text: "A-01 remains contained..."
│   },
│   // ... up to 60 reports
│ ]
└── pendingActions
    ├── experiment
    │   ├── leadId: "s-1"
    │   ├── intensity: "medium"
    │   └── safeguards: "standard"
    ├── reassignment
    │   ├── staffId: "s-5"
    │   └── targetRole: "engineering"
    ├── protocol
    │   └── mode: "balanced"
    └── clarification
        └── enabled: false
```

---

## Extension Points

### Adding a New Experiment Type

1. Add constants to `src/data.js`
2. Create formula function in `src/sim.js`
3. Add UI form section in `src/ui.js`
4. Update CHANGELOG.md and SPEC.md

### Adding a New Protocol Mode

1. Add to `PROTOCOL_MODES` in `src/data.js`
2. Add case in `applyProtocol()` in `src/sim.js`
3. UI auto-updates (reads from constant)

### Adding New Anomaly

1. Add to `DEFAULT_STATE.anomaly` in `src/data.js` (or add variant logic)
2. Update `resolveExperiment()` if anomaly affects formula behavior
3. Test via multiple cycles to verify distinct behavior

---

## Performance Characteristics

- **simulateCycle()**: <10ms typical (deterministic, no I/O)
- **renderUI()**: <50ms typical (DOM updates, 200+ reports in history)
- **state persistence**: <5ms (localStorage sync)
- **Page load**: <100ms (module parsing + initial render)

---

## Testing Utilities

When writing tests, use these helpers:

```javascript
import { simulateCycle } from './sim.js';
import { createRng } from './utils/rng.js';
import { DEFAULT_STATE } from './data.js';

// Create a test state
const state = JSON.parse(JSON.stringify(DEFAULT_STATE));
state.meta.cycle = 10;
state.site.powerLoad = 50;

// Simulate one cycle
const next = simulateCycle(state);

// Verify determinism
const rng1 = createRng(12345);
const val1 = rng1();
const rng2 = createRng(12345);
const val2 = rng2();
assert.equal(val1, val2);  // Same seed → same result
```

---

## Glossary

- **Anomaly**: The entity being contained (e.g., "The Discrepancy Field")
- **Cycle**: One round of player decisions → simulation → state update
- **Drift**: Anomaly instability metric (0-100); higher drift makes observation less reliable
- **Strain**: Pressure on containment systems (0-100)
- **Competence**: Staff ability at their current role (0-100)
- **Stress**: Staff fatigue level (0-100)
- **Caution**: Staff tendency toward risk-aversion (0-100)
- **Integrity**: Containment system condition (0-100)
- **RNG**: Pseudo-random number generator (seeded for determinism)

---

**Last Updated**: March 2026
**API Version**: 0.1.0

For implementation details, see: `DEVELOPING.md`, `SPEC.md`, `DECISIONS.md`

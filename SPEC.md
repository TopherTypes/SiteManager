# SPEC.md — Site Director MVP Baseline Specification

## 1. Scope

This spec defines the initial base implementation of the Site Director MVP translated from `PRD.md` into executable repository structure and behavior.

## 2. Runtime + Platform

- **Platform:** Desktop browser
- **Stack:** HTML, CSS, ES module JavaScript
- **Persistence:** `localStorage`
- **Simulation Clock:** commit-based cycles (no real-time ticking)

## 3. Architectural Modules

### 3.1 `src/data.js`
Defines static baseline domain content:
- anomaly profile (A-01)
- staff roster and attributes
- action catalog and constraints
- default system state values

### 3.2 `src/state.js`
Responsible for:
- constructing initial state
- loading/saving state from storage
- applying safe state normalization when fields are missing

### 3.3 `src/utils/rng.js`
Provides deterministic seeded random utilities used by simulation.

### 3.4 `src/sim.js`
Owns cycle resolution logic:
- applies pending decisions
- updates anomaly/infrastructure/staff metrics
- computes risks and report output
- increments cycle index

### 3.5 `src/ui.js`
Renders UI regions and binds interactions:
- top metrics
- report feed
- anomaly/system summary
- action controls and commit workflow

### 3.6 `src/main.js`
Bootstraps app, orchestrates state + simulation + render pipeline.

## 4. State Model (MVP Baseline)

State shape includes:
- `meta`
  - `version`
  - `seed`
  - `cycle`
- `site`
  - `containmentStability` (0-100)
  - `powerLoad` (0-100)
  - `containmentIntegrity` (0-100)
- `anomaly`
  - `driftLevel` (0-100)
  - `containmentStrain` (0-100)
  - `observationPressure` (0-100)
  - `knowledgeGained` (number)
- `staff[]`
  - `id`, `name`, `role`, `competence`, `caution`, `stress`
- `reports[]`
  - cycle-tagged generated notes for player review
- `pendingActions`
  - queued decision payloads prior to commit

## 5. Action Constraints

- Max actions per cycle are configurable in data defaults (baseline: 3).
- Supported action families:
  1. Authorize Experiment
  2. Reassign Staff
  3. Adjust Protocols
  4. Request Clarification

Action inputs are validated defensively and clamped to allowed values.

## 6. Simulation Rules (Baseline Approximation)

1. Resolve pending actions into numerical modifiers.
2. Apply deterministic random perturbations derived from current seed stream.
3. Update anomaly and site metrics with clamps to valid ranges.
4. Update staff stress based on workload/risk profile.
5. Emit 1–3 reports reflecting perspective-specific uncertainty.
6. Advance cycle counter and persist state.

## 7. Information Reliability Layer

UI intentionally displays approximations:
- rounded percentages
- qualitative labels (low/medium/high)
- slight reporting noise tied to drift and staff reliability

Internal state remains precise and hidden.

## 8. Failure/Degradation Handling

Baseline implementation tracks risk conditions but does not force a hard game-over screen in this version.
Potential critical states are surfaced in reports and status badges.

## 9. Non-Goals in This Base State

- Real-time progression between commits
- Multi-anomaly interactions
- Narrative scripting engine
- backend, auth, cloud save, networking

## 10. Acceptance Criteria for Base State

A valid base state must:
- run by opening `index.html`
- allow selecting decisions and committing cycles
- persist/load state between refreshes
- produce deterministic progression from same state history
- expose all key documentation files at repository root

# Anomalous Operations Bureau: Site Director

A browser-based, single-player management simulation prototype focused on constrained decision making under uncertainty.

This repository contains a runnable **MVP base state** derived from `PRD.md`.

## Vision

You are the Site Director of an anomalous containment facility. Each cycle, you review imperfect reports, make limited strategic decisions, and commit the next simulation step.

Core design tension:

- Pursuing knowledge increases risk.
- Information is useful but never perfectly reliable.
- You steer outcomes indirectly through staff, protocols, and experiment policy.

## MVP Baseline Included Here

- Single site
- One anomaly (A-01: Discrepancy Field)
- Five staff members
- Cycle-based simulation with deterministic seed
- Approximate player-facing metrics
- Action budget per cycle
- Report feed with reliability noise
- Local persistence via `localStorage`

## Project Structure

- `index.html` — root application entry point
- `src/styles.css` — layout and visual baseline
- `src/main.js` — app bootstrap + main loop wiring
- `src/state.js` — state container + persistence
- `src/sim.js` — deterministic cycle simulation logic
- `src/data.js` — constants, defaults, and content catalog
- `src/ui.js` — rendering and interaction bindings
- `src/utils/rng.js` — seeded pseudo-random generator
- `SPEC.md` — implementation-oriented specification
- `DECISIONS.md` — architecture and design decision log
- `CHANGELOG.md` — Keep a Changelog history
- `AGENTS.md` — repository automation and contribution guidance

## Running Locally

No build step is required.

1. Open `index.html` directly in a browser.
2. Or serve the repository root via a static server for stricter module behavior.

Example (Python):

```bash
python -m http.server 8080
```

Then open: `http://localhost:8080`

## Controls

- Configure pending decisions in the right panel.
- Observe projected impact before committing.
- Click **Commit Cycle** to advance simulation.
- Use **Reset Save** to start a clean run.

## Data + Save Model

- State is stored in localStorage key: `site-director-mvp-state-v0`.
- Simulation uses seeded randomness to support deterministic replay from the same state history.
- The UI intentionally surfaces approximations, not true internal values.

## Current Scope Boundaries

Non-goals for this baseline:

- Real-time progression between commits
- Multiple anomalies or sites
- Multiplayer/online systems
- Story scripting framework
- Heavy visual polish/animation

## Development Notes

- Keep logic deterministic and testable.
- Prefer small, reviewable extensions.
- Preserve distinction between **true state** and **player-visible approximation**.
- Document meaningful behavior changes in `CHANGELOG.md` and `SPEC.md`.

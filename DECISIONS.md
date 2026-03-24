# DECISIONS.md

Lightweight architecture and product decision log for the MVP baseline.

## D-001: Vanilla Web Stack for MVP
- **Date:** 2026-03-24
- **Status:** Accepted
- **Decision:** Use plain HTML/CSS/JavaScript with ES modules and no framework.
- **Why:** Lowest setup friction, aligns with PRD non-goals, easy to reason about deterministic systems.
- **Trade-off:** Less built-in structure than framework ecosystems.

## D-002: Deterministic Simulation Core with Seeded RNG
- **Date:** 2026-03-24
- **Status:** Accepted
- **Decision:** Use a seeded pseudo-random generator and persist seed + step count in state.
- **Why:** Supports reproducible outcomes, easier debugging, and future balancing.
- **Trade-off:** Requires discipline around randomness consumption order.

## D-003: Separate True State from Player-Facing Approximation
- **Date:** 2026-03-24
- **Status:** Accepted
- **Decision:** Keep internal numeric state canonical while presenting rounded/noisy metrics in UI.
- **Why:** Core design pillar of uncertainty and interpretive play.
- **Trade-off:** Added complexity in view-model generation.

## D-004: Cycle-Commit Simulation Model
- **Date:** 2026-03-24
- **Status:** Accepted
- **Decision:** Advance simulation only when user explicitly commits a cycle.
- **Why:** Matches low-pressure asynchronous play and avoids real-time complexity.
- **Trade-off:** Requires clear UX signaling for commit boundaries.

## D-005: LocalStorage Persistence for Base State
- **Date:** 2026-03-24
- **Status:** Accepted
- **Decision:** Persist state in browser localStorage with a versioned key.
- **Why:** Zero backend requirement for MVP and fast local iteration.
- **Trade-off:** Save portability and migration handling are limited at this stage.

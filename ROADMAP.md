# SiteManager Development Roadmap

**Latest Update**: March 2026
**Current Version**: 0.1.0 (MVP Baseline)
**Scope**: 4 phases covering 18+ months (Q2 2026 — 2027)

---

## Vision & Roadmap Philosophy

SiteManager is a browser-based management simulation centered on **constrained decision-making under uncertainty**. The core tension—that pursuing knowledge increases risk—drives meaningful player choices.

This roadmap reflects:
- **Realistic scope** (not over-committed)
- **Quality over speed** (depth before breadth)
- **Iterative refinement** (early adopter feedback informs later phases)
- **Sustainable pace** (avoiding burnout, feature creep)

Phases are designed to be achievable in 3-4 month sprints with small teams or solo developers. Each phase builds on prior infrastructure.

---

## Phase 0: Current State (v0.1.0, Released March 2026)

### Baseline Features
- **Single anomaly**: "The Discrepancy Field" (A-01) with baseline properties
- **Five staff members**: Researchers, security, engineering (balanced roster)
- **Four action types**: Experiments, reassignments, protocol adjustments, clarification requests
- **Cycle-based simulation**: Deterministic RNG, reproducible from seed
- **Local persistence**: Browser localStorage for resumable play
- **Approximate player-facing metrics**: Intentional noise based on drift level
- **Risk assessment**: Critical/contained status display
- **Report feed**: 60-cycle history with source attribution

### Known Limitations
- No win/loss conditions (unclear when to stop playing)
- No staff fatigue mechanics (all roles equally affected by stress)
- Single anomaly type (limited replayability)
- No save file export/import (cleared on browser data deletion)
- No automated testing infrastructure
- No CI/CD deployment automation

---

## Phase 1: Foundation (v0.2.0, Target: Q2/Q3 2026)

**Theme**: Stabilization, infrastructure, clear win/loss conditions, playability polish

**Effort**: ~6-8 weeks
**Priority Distribution**: 40% features, 40% infrastructure, 20% tech debt

### Tier 1: Must-Have Features

#### **1.1 Win/Loss Conditions** ⭐ Prerequisite for all higher phases
- **Effort**: Medium (3-4 days)
- **Priority**: Must-Have
- **Description**:
  - Define game-over trigger: Containment Stability drops below 20% OR Containment Integrity below 30%
  - Define win condition: Research >= 50 AND Drift Level <= 35 AND Stability >= 60 (for 3 consecutive cycles)
  - Add game state: "in-progress" / "won" / "lost"
  - Clear UI feedback: modal/banner indicating win/loss state
  - Action restrictions: disable action forms when game is over

- **Acceptance Criteria**:
  - [ ] Players can clearly see when they've won or lost
  - [ ] Loss state triggers correctly (containment cascade)
  - [ ] Win state feels achievable but non-trivial (not reached before cycle 10)
  - [ ] Reset button clears win/loss state for new game

#### **1.2 Staff Fatigue Mechanics** ⭐ Core gameplay depth
- **Effort**: Medium (4-5 days)
- **Priority**: Must-Have
- **Description**:
  - **Role-specific stress scaling**: Researchers burn out 15% faster on high-intensity experiments than security
  - **Fatigue effects**:
    - Stress 0-35: no penalty
    - Stress 35-70: competence -5 (soft degradation)
    - Stress 70-100: competence -15 + experiment lead fails 30% of time (critical penalty)
  - **Recovery actions**:
    - Reassigning to lower-stress roles (security/engineering) reduces stress 8/cycle if no actions taken
    - Clarification requests benefit all staff equally (shared benefit)
  - **Visual indicators**: Staff list shows current competence reduction from stress

- **Acceptance Criteria**:
  - [ ] Researchers stress increases faster than security on identical experiments
  - [ ] High-stress staff clearly underperform (lower knowledge gain, more failure)
  - [ ] Stress recovery is tangible but requires strategic downtime
  - [ ] Players face real choice: push hard now vs. protect staff long-term

#### **1.3 GitHub Pages Deployment Stability** ⭐ Infrastructure
- **Effort**: Small (1-2 days)
- **Priority**: Must-Have
- **Description**:
  - Create `.github/workflows/deploy.yml`: CI pipeline triggered on push to main
  - Validation jobs:
    1. HTML/CSS/JS syntax check (parse validation)
    2. Module import check (verify ES modules load without errors)
    3. localStorage API availability test (sandbox environment compatibility)
  - Deploy to GitHub Pages branch on success
  - Add status badge to README.md

- **Acceptance Criteria**:
  - [ ] GitHub Actions workflow file exists and passes on push
  - [ ] Status badge visible on README.md
  - [ ] GitHub Pages site automatically updated on merge to main
  - [ ] No manual deployment steps required

### Tier 2: Should-Have Features

#### **2.1 Anomaly Content Expansion**
- **Effort**: Medium (3-4 days)
- **Priority**: Should-Have
- **Description**:
  - Add 2-3 new anomaly profiles to data.js (e.g., "Resonance Cascade", "Entropy Well")
  - Each anomaly defines:
    - Initial drift/strain/pressure values
    - Experiment response curves (high drift anomalies drift faster)
    - Staff role affinities (some anomalies favor certain roles)
    - Difficulty scaling (easy/normal/hard variants)
  - Seed determines which anomaly (consistent replay)
  - Difficulty shown at game start

- **Acceptance Criteria**:
  - [ ] At least 3 anomaly profiles playable
  - [ ] Each feels mechanically distinct (different difficulty, pacing)
  - [ ] Seed replays load same anomaly every time
  - [ ] Random seed selection works in new games

#### **2.2 Save/Load UI**
- **Effort**: Medium (3-4 days)
- **Priority**: Should-Have
- **Description**:
  - "Export Save" button: download state as JSON file (named: "sitemanager-[date].json")
  - "Import Save" button: upload JSON, validate format, load into localStorage
  - "Delete Save" button: confirm dialog, remove localStorage entry
  - Save versioning: detect version mismatch, offer migration or rejection

- **Acceptance Criteria**:
  - [ ] Save exports to browser download folder as JSON
  - [ ] Can re-upload save and resume from exact cycle
  - [ ] Old save formats detected and handled gracefully (migrate or warn)
  - [ ] No data loss on import/export cycle

### Tier 3: Tech Debt & Infrastructure

#### **3.1 Code Documentation (Phase 1 of this work)**
- **Effort**: Small-Medium (2-3 days)
- **Priority**: Must-Have (for maintainability)
- **Description**:
  - Add JSDoc to all exported functions (src/*.js)
  - Add inline comments to complex formulas in src/sim.js
  - Document formula constants (why 18, why 0.6, etc.)
  - Cross-reference SPEC.md and DECISIONS.md

- **Acceptance Criteria**:
  - [ ] All 6 modules have module-level JSDoc
  - [ ] All exported functions documented with @param/@returns
  - [ ] Formulas explained with multiplier rationale
  - [ ] No "obvious" comments (avoid restatement)

#### **3.2 Extract Formula Constants**
- **Effort**: Small (1 day)
- **Priority**: Should-Have
- **Description**:
  - Replace magic numbers with named constants (e.g., `KNOWLEDGE_COMPETENCE_DIVISOR = 18`)
  - Group in `src/data.js` under "Formula Configuration" section
  - Add comments explaining each constant's role

- **Acceptance Criteria**:
  - [ ] All formula multipliers are named constants
  - [ ] Constants are commented with rationale
  - [ ] Changing a constant affects simulation as expected

### Phase 1 Success Metrics
- [ ] Clear, achievable win/loss conditions (games typically end 15-25 cycles)
- [ ] Staff fatigue creates meaningful strategic depth
- [ ] GitHub Pages deployment fully automated
- [ ] 2-3 anomalies provide variety for replays
- [ ] Save/load works for save preservation
- [ ] All code documented for future contributors

---

## Phase 2: Depth & Scale (v0.3.0, Target: Q3/Q4 2026)

**Theme**: Rich simulation, narrative elements, social gameplay foundation

**Effort**: ~8-12 weeks
**Priority Distribution**: 50% features, 30% infrastructure, 20% polish

### Tier 1: Core Features

#### **2.1 Advanced Report System**
- **Effort**: Large (5-6 days)
- **Priority**: Should-Have
- **Description**:
  - **Report source credibility**: Each source (Research, Security, Engineering) has reliability score (0-100)
  - **Report types**: Incident reports, metrics summaries, staff briefings, anomaly observations
  - **Narrative generation**: Procedural text templates based on anomaly state, staff actions, roll outcomes
  - **Credibility mechanic**: High-drift environments produce unreliable reports; clarification requests improve accuracy
  - UI enhancement: Show source credibility badge

- **Acceptance Criteria**:
  - [ ] Each report shows credibility score
  - [ ] Drift > 60 significantly reduces credibility
  - [ ] Clarification requests visibly improve next report accuracy
  - [ ] Report text feels contextual to cycle events

#### **2.2 Staff Evolution System**
- **Effort**: Large (6-7 days)
- **Priority**: Should-Have
- **Description**:
  - **Competence growth**: Staff competence increases 0.5-1.5 per successful experiment (cycles with no critical losses)
  - **Specialization**: Track "expertise" per role (research, security, engineering); +20% bonus to own role, -10% penalty to unfamiliar
  - **Morale system**: Separate from stress; higher morale reduces stress recovery time, increases clarification efficacy
  - **Character arcs**: Long-term staff development feels meaningful

- **Acceptance Criteria**:
  - [ ] Staff visibly improve after successful cycles
  - [ ] Competence progression is non-trivial (takes 20+ cycles to master)
  - [ ] Specialization makes long-term assignments strategic
  - [ ] Morale ties to staff story progression

#### **2.3 Incident Escalation System**
- **Effort**: Medium-Large (4-5 days)
- **Priority**: Nice-to-Have
- **Description**:
  - **Random high-stress events**: Triggered by high drift/instability (< 10% chance per cycle if unstable)
  - **Cascading failures**: Example: Drift spike → equipment failure → staff injury → temporary competence loss
  - **Forced decisions**: Incidents present binary choices (fix now at cost, or manage consequences)
  - **Narrative weight**: Feel like turning points in playthrough

- **Acceptance Criteria**:
  - [ ] Incidents trigger at reasonable frequency (not every cycle, not none)
  - [ ] Decisions feel meaningful (each choice has real consequence)
  - [ ] Incidents remembered in reports (narrative continuity)

#### **2.4 Advanced Experiments**
- **Effort**: Large (6-7 days)
- **Priority**: Should-Have
- **Description**:
  - **Multi-cycle experiments**: Schedule an experiment to resolve over 3 cycles with compounding risk
  - **Cross-staff collaboration**: Team experiments (2+ staff) have higher knowledge gain but higher combined stress
  - **Specialized equipment**: One-time consumables (scanners, containment fields) that boost specific outcomes
  - **Expanded action catalog**: At least 6 experiment types with different risk/reward profiles

- **Acceptance Criteria**:
  - [ ] Multi-cycle experiments feel rewarding (higher knowledge + risk)
  - [ ] Team experiments create strategic depth (who to collaborate?)
  - [ ] Equipment consumables are scarce and decision-worthy
  - [ ] Experiment variety supports different playstyles

#### **2.5 Leaderboard & Seed Sharing**
- **Effort**: Medium (3-4 days)
- **Priority**: Nice-to-Have (social feature)
- **Description**:
  - **Seed sharing**: Generate shareable seed codes (e.g., "A-01:HARD:SEED12345")
  - **Challenge leaderboard**: Track player scores on same seed (longest survival, highest research, etc.)
  - **Leaderboard UI**: Simple table, sortable by metric, show top 20 players
  - Backend: Simple REST API or GitHub Gist storage for leaderboard (optional)

- **Acceptance Criteria**:
  - [ ] Seeds are shareable and reproducible
  - [ ] Leaderboard tracks multiple metrics
  - [ ] Players can see how they rank on shared challenges

### Tier 2: Infrastructure

#### **2.6 Enhanced CI/CD**
- **Effort**: Medium (2-3 days)
- **Priority**: Should-Have
- **Description**:
  - Add Vitest test suite for src/sim.js (formula verification)
  - Target: >80% coverage of simulateCycle and resolveExperiment
  - Example tests:
    - "High intensity experiment produces knowledge in expected range"
    - "Role imbalance increases drift predictably"
    - "Deterministic seed produces identical outcomes"
  - CI runs tests on every PR, blocks merge if coverage drops

- **Acceptance Criteria**:
  - [ ] Vitest configured and tests running in CI
  - [ ] >80% coverage for sim.js
  - [ ] Tests verify formula correctness and determinism
  - [ ] No merge without passing tests

#### **2.7 Performance Optimization**
- **Effort**: Small (1-2 days)
- **Priority**: Nice-to-Have
- **Description**:
  - Profile UI rendering with large report feeds (200+ reports)
  - Optimize: virtual scrolling, memoization, DOM batching if needed
  - Measure: target <50ms render time for any state change

- **Acceptance Criteria**:
  - [ ] No lag when scrolling report feed
  - [ ] Large save files load instantly
  - [ ] Cycle simulation completes in <100ms

### Phase 2 Success Metrics
- [ ] Advanced reports feel alive and contextual
- [ ] Staff feel like characters with growth arcs
- [ ] Test coverage ensures formula integrity
- [ ] Multiple experiment types support playstyle variety
- [ ] Seed sharing enables community challenges

---

## Phase 3: Production & Multiplayer (v1.0.0, Target: 2027)

**Theme**: Multiplayer foundation, production-ready features, scalability

**Effort**: ~12-16 weeks
**Priority Distribution**: 60% features, 20% infrastructure, 20% polish

### Tier 1: Multiplayer & Narrative

#### **3.1 Multiplayer Foundation** (Prerequisite: Async Backend)
- **Effort**: Extra-Large (10-14 days)
- **Priority**: Nice-to-Have
- **Description**:
  - **Shared anomaly control**: 2-4 directors manage same anomaly asynchronously
  - **Async turns**: Each director submits actions, cycle resolves once all submit or timeout expires
  - **Collaborative decisions**: Vote on protocol modes and experiments (majority wins)
  - **Communication board**: Message between directors between cycles
  - **Conflict resolution**: If simultaneous reassignments conflict, random tiebreak
  - Backend: WebSocket + Node.js + MongoDB (or similar)

- **Acceptance Criteria**:
  - [ ] 2 players can join same facility and see shared anomaly
  - [ ] Cycle doesn't advance until all players submit or timeout (3 mins)
  - [ ] Conflict resolution is fair and transparent
  - [ ] Latency < 500ms (acceptable for async play)

#### **3.2 Multiple Sites**
- **Effort**: Extra-Large (10-12 days)
- **Priority**: Nice-to-Have
- **Description**:
  - **Cross-site anomalies**: Anomalies that span multiple Sites; containment in one affects others
  - **Resource allocation**: Researchers/staff can be deployed to any site; limited pool
  - **Site-specific events**: Each site has local incident pool (staff injury, power surge, etc.)
  - **Campaign victory**: Win condition involves all sites achieving stability

- **Acceptance Criteria**:
  - [ ] Players manage 2+ sites with shared resource pool
  - [ ] Cross-site anomalies feel connected
  - [ ] Campaign victory feels epic (requires coordination)

#### **3.3 Narrative Campaign**
- **Effort**: Large (7-8 days)
- **Priority**: Nice-to-Have
- **Description**:
  - **Story beats**: Procedural narrative unlocks based on milestone conditions (research, cycles, incidents)
  - **Character arcs**: Staff get personal story missions ("Dr. Vale suspects anomaly origin...")
  - **Branching plot**: Major decisions (risk staff to gain knowledge vs. protect them) affect story outcome
  - **Ending variations**: 3-5 distinct endings based on playstyle and choices

- **Acceptance Criteria**:
  - [ ] Story elements emerge naturally during play
  - [ ] Different playstyles lead to different narratives
  - [ ] Endings feel earned and reflect player choices

### Tier 2: Platform Features

#### **3.4 Mobile Responsiveness**
- **Effort**: Medium (3-4 days)
- **Priority**: Nice-to-Have
- **Description**:
  - Responsive CSS (breakpoints for 320px - 2560px)
  - Touch-friendly form controls (larger targets)
  - Swipe navigation for report feed
  - Works on iOS Safari and Chrome Android

- **Acceptance Criteria**:
  - [ ] Fully playable on phone-sized screens
  - [ ] No horizontal scroll needed
  - [ ] Touch controls responsive (< 200ms)

#### **3.5 Visual Enhancement**
- **Effort**: Medium (4-5 days)
- **Priority**: Nice-to-Have
- **Description**:
  - Animated anomaly visualizations (drift visualization, containment field effects)
  - Staff avatars and portraits
  - Improved iconography for actions, roles, statuses
  - Subtle animations (metric updates, cycle transitions)

- **Acceptance Criteria**:
  - [ ] Visuals enhance without overwhelming clarity
  - [ ] Animations are < 300ms (no slowdown)
  - [ ] Art style is cohesive and professional

### Tier 3: Infrastructure & Scale

#### **3.6 Backend Foundation**
- **Effort**: Large (6-7 days)
- **Priority**: Nice-to-Have (only if multiplayer pursued)
- **Description**:
  - Node.js + Express server
  - MongoDB for game state + player accounts
  - WebSocket for real-time sync
  - REST API for leaderboards, seed sharing
  - Docker containerization for deployment

- **Acceptance Criteria**:
  - [ ] Deploys to cloud (AWS, Heroku, etc.) without friction
  - [ ] Database scales to 10k+ concurrent players
  - [ ] Latency acceptable for async play

### Phase 3 Success Metrics
- [ ] Multiplayer infrastructure supports 2-4 directors per game
- [ ] Campaign narrative spans 50+ cycles with meaningful choices
- [ ] Fully responsive: playable on phone, tablet, desktop
- [ ] Visual presentation matches ambition of gameplay
- [ ] Backend ops are low-overhead (automated deploys, monitoring)

---

## Phase 4: Future & Community (Post-1.0.0)

**Exploration**: Features speculative or deferred beyond 2027

### Possible Directions
- **VR/AR Experiments**: Immersive observation modes
- **Procedurally Generated Anomalies**: Infinite content via algorithm
- **User-Generated Content Tools**: Let players create custom anomalies/experiments
- **Cross-Game Universe**: SiteManager instances affect world state
- **Mod Support**: Community-created extensions, stories, anomalies
- **Esports/Speedrunning**: Tournament infrastructure, replays with commentary
- **Accessibility**: Full a11y audit, screen reader support, customizable difficulty

---

## Timeline & Sequencing

| Phase | Target | Duration | Key Blockers | Dependencies |
|-------|--------|----------|--------------|--------------|
| v0.2.0 | Q2/Q3 2026 | 6-8 weeks | Win/loss implementation | None |
| v0.3.0 | Q3/Q4 2026 | 8-12 weeks | Backend design (if multiplayer) | v0.2.0 release |
| v1.0.0 | 2027 | 12-16 weeks | Multiplayer backend deployment | v0.3.0 release |

## Quarterly Review Cadence

Every quarter, this roadmap is reviewed and updated:
1. **Completed items** marked and moved to CHANGELOG.md
2. **Timeline adjusted** based on actual velocity
3. **Priorities re-evaluated** based on player feedback
4. **New opportunities** identified and added to backlog

---

## Contribution & Roadmap Engagement

Want to propose a feature or influence direction?

1. **Open a GitHub issue** with the category `[feature-proposal]`
2. **Include**:
   - Feature description and use case
   - Estimated effort (S/M/L/XL)
   - Which phase it belongs in (or new phase)
   - Any blocker dependencies
3. **Maintainer review**: Fit against roadmap priorities
4. **Community discussion**: Open for feedback before acceptance

---

## Success Criteria for Each Phase

### v0.2.0 (Foundation)
- ✅ Game has clear win/loss conditions
- ✅ Staff fatigue creates strategic depth
- ✅ GitHub Pages deployment is automated
- ✅ Community reports >15 unique anomaly seeds played

### v0.3.0 (Depth)
- ✅ 50+ cycles average game length (up from v0.2)
- ✅ Test suite covers 80%+ of simulation
- ✅ Players voluntarily share seeds and challenge each other
- ✅ Staff feel like characters, not statistics

### v1.0.0 (Scale)
- ✅ Multiplayer games complete successfully
- ✅ Campaign narratives span 100+ cycles
- ✅ Mobile playtime is 30% of desktop playtime
- ✅ Community actively creates content

---

**Last Updated**: March 2026
**Next Review**: June 2026
**Maintainer**: SiteManager Team

For detailed implementation notes, see: `DEVELOPING.md`, `API.md`, `DECISIONS.md`

# Product Requirements Document  
## Anomalous Operations Bureau: Site Director (Working Title)

---

## 1. Product Overview

**Type:** Browser-based, single-player management simulation  
**Platform:** Desktop web (initially)  
**Session Model:** Asynchronous, cycle-based (idle-supported)  

**Core Fantasy:**
> You are the Site Director of an anomalous containment facility, making high-level decisions based on incomplete and sometimes unreliable information.

**Primary Experience Goal:**
- Intellectually engaging
- Low-pressure, interruptible gameplay
- Emergent narrative through system interaction
- Meaningful trade-offs between knowledge and safety

---

## 2. Design Pillars

### 2.1 Knowledge vs Risk
- Player is incentivised to pursue knowledge (experiments, observation)
- Increased knowledge introduces instability and risk
- Safe play limits progression and discovery

---

### 2.2 Ambiguous but Learnable Systems
- Information is:
  - partial
  - delayed
  - sometimes inconsistent
- Underlying systems are structured and learnable over time

---

### 2.3 Indirect Control
- Player does not act directly on anomalies
- Player influences outcomes via:
  - staff assignment
  - policy decisions
  - experiment configuration

---

### 2.4 Constraint-Driven Gameplay
- Limited actions per cycle
- Limited resources (staff, power, attention)
- Trade-offs are unavoidable and meaningful

---

### 2.5 Low Pressure, Persistent World
- No penalty for delayed interaction beyond minimum cycle time
- Simulation progresses only when a cycle is committed
- Designed for play alongside other activities

---

## 3. Core Gameplay Loop

### 3.1 Cycle Structure

Each gameplay cycle consists of:

#### 1. Simulation Phase (Idle / System Driven)
- Minimum real-world time passes (configurable, e.g. 30–60 minutes)
- Systems evolve:
  - anomaly state changes
  - staff perform assigned tasks
  - experiments resolve
  - infrastructure degrades or stabilises

---

#### 2. Review Phase (Player Input)
Player receives a curated bundle of information:

- Experiment reports
- Incident logs
- Staff notes
- System alerts
- Site metrics

Information may be:
- incomplete
- biased
- partially contradictory

---

#### 3. Decision Phase
Player is given a limited number of actions (e.g. 2–3 per cycle):

Examples:
- Authorise and configure an experiment
- Reassign staff
- Adjust containment protocols
- Allocate resources
- Request clarification/investigation

---

#### 4. Commit Phase
- Player submits decisions
- Next simulation cycle begins

---

## 4. MVP Scope (First Playable Version)

### 4.1 Site
- Single containment facility

---

### 4.2 Anomaly
- 1 anomaly (A-01: “The Discrepancy Field”)

---

### 4.3 Staff
- 5 total staff:
  - 2 Researchers
  - 2 Security Personnel
  - 1 Engineer

Each staff member has:
- role
- competence
- caution
- stress level

---

### 4.4 Actions per Cycle
- 2–3 selectable actions

---

### 4.5 Reports per Cycle
- 1–3 generated reports

---

## 5. Core Systems

---

### 5.1 Anomaly System (A-01: Discrepancy Field)

**Concept:**
An anomaly that introduces divergence between:
- observed reality
- recorded data
- reported information

---

#### Key Variables
- Drift Level (information inconsistency)
- Containment Strain
- Observation Pressure
- Knowledge Gained

---

#### Behaviour Rules
- Increased observation → increased drift
- Increased drift → reduced information reliability
- High drift → increased risk of containment anomalies

---

---

### 5.2 Staff System

Each staff member includes:

#### Attributes
- Competence (task effectiveness)
- Caution (risk tolerance)
- Stress (affects performance and report quality)

---

#### Behaviour
- Execute assigned roles
- Generate reports based on:
  - perspective
  - competence
  - current stress

---

#### Information Reliability
- Staff are not malicious
- Reports may be:
  - incomplete
  - biased
  - incorrect due to context

---

---

### 5.3 Infrastructure System

#### Key Systems
- Power Stability
- Containment Integrity

---

#### Behaviour
- Power affects:
  - containment systems
  - experiment safety
- Infrastructure degradation introduces indirect risk

---

---

### 5.4 Information Layer (Critical System)

All player-facing information is filtered through:
- delay
- bias
- drift (from anomaly)

---

#### Design Principle
> The player never sees “true state”—only approximations

---

## 6. Player Actions (MVP Set)

---

### 6.1 Authorise Experiment (Primary Action)

Player configures:

- Lead Researcher
- Intensity (Low / Medium / High)
- Safeguards (Minimal / Standard / Reinforced)

---

#### Effects
- Knowledge gain (variable)
- Drift increase (scales with intensity)
- Containment strain
- Staff stress impact

---

---

### 6.2 Reassign Staff

- Move staff between roles:
  - Research
  - Security
  - Engineering

---

#### Effects
- Alters system performance
- Impacts report quality and reliability

---

---

### 6.3 Adjust Protocols

Examples:
- Tighten containment
- Reduce power allocation
- Restrict access

---

#### Effects
- Improves stability
- Reduces research speed
- May increase hidden risks (e.g. drift)

---

---

### 6.4 Request Clarification

- Improves information quality next cycle

---

#### Effects
- Reduces uncertainty
- Consumes action slot

---

## 7. Metrics (Player-Facing)

Displayed as approximate values:

- Containment Stability (approximate %)
- Power Load (qualitative or %)
- Staff Stress (low / medium / high)
- Research Progress (low / moderate / significant)

---

## 8. Failure States

Failure is not binary but includes:

- Containment Breach
- Staff Casualties
- System Instability
- Reputational Damage (future system expansion)
- Reduced operational capacity

---

## 9. Progression Model

### MVP:
- Endless simulation
- No formal end state
- Restart available with new seed

---

### Long-Term (Post-MVP):
- Multiple anomalies
- Interacting systems
- Funding and reputation layers
- Expanded staff roles

---

## 10. UI/UX Requirements

---

### Layout

#### Top Bar
- Site metrics overview

---

#### Left Panel
- Reports feed (scrollable)

---

#### Centre Panel
- Anomaly status
- Key system indicators

---

#### Right Panel
- Action cards (modular, interactive)

---

---

### Interaction Principles

- Minimal clicks to act
- Information grouped and scannable
- Actions clearly constrained
- No time pressure UI elements

---

## 11. Technical Requirements (Initial)

- Single HTML file (MVP)
- Vanilla JavaScript (no frameworks required initially)
- Local state management (localStorage)
- Deterministic simulation with seed support

---

## 12. Non-Goals (MVP)

- No real-time simulation
- No multiple sites
- No complex UI animations
- No deep narrative scripting
- No multiplayer or online features

---

## 13. Success Criteria (MVP)

The MVP is successful if:

- Player experiences meaningful decision tension within 3 cycles
- Player can infer system behaviour over time
- At least one “unexpected but explainable” outcome occurs
- Player wants to restart to explore different approaches

---

## 14. Future Expansion Hooks

- Additional anomaly types
- Cross-anomaly interactions
- Staff relationships and politics
- Advanced experiment configuration
- Persistent world progression
- Narrative event chains

---

## 15. Summary

This product is not a traditional idle game.

It is:
- a **decision-driven simulation**
- with **idle pacing**
- focused on **interpretation, trade-offs, and emergent narrative**

The core design challenge is balancing:
> ambiguity vs clarity, and control vs uncertainty

---

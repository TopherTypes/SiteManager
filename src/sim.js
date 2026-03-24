/**
 * Deterministic cycle simulation logic.
 *
 * Core responsibility: Resolve all pending player actions in a single cycle:
 * - Experiments: Generate knowledge, drift, strain, stress deltas
 * - Reassignments: Move staff to new roles, apply stress penalty
 * - Protocols: Adjust containment posture (tighten/relax/balance)
 * - Clarification: Improve observation accuracy next cycle
 *
 * All randomness is seeded by cycle number, ensuring deterministic replay from
 * the same state history. Output state has advanced cycle counter and updated metrics.
 *
 * See SPEC.md for full formula documentation and DECISIONS.md D-002 for
 * determinism justification.
 */

import { ACTION_LIMIT_PER_CYCLE } from './data.js';
import { createRng, randomInt, randomRange } from './utils/rng.js';

/**
 * Utility: clamp a value to a range [min, max].
 *
 * @param {number} value - Value to clamp
 * @param {number} min - Lower bound (default: 0)
 * @param {number} max - Upper bound (default: 100)
 * @returns {number} Value clamped to [min, max]
 */
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Utility: select a random element from an array using seeded RNG.
 *
 * @param {object} rng - Seeded RNG function
 * @param {array} items - Array to pick from
 * @returns {*} Random element
 */
function pick(rng, items) {
  return items[randomInt(rng, 0, items.length - 1)];
}

/**
 * Utility: count staff by role.
 *
 * Used to calculate balance bonuses/penalties in the simulation.
 * More researchers than security → higher drift risk.
 *
 * @param {array} staff - Staff roster
 * @returns {object} {research: count, security: count, engineering: count}
 */
function getRoleCounts(staff) {
  return staff.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    { research: 0, security: 0, engineering: 0 }
  );
}

/**
 * Resolve experiment action: calculate knowledge, drift, strain, and stress deltas.
 *
 * Formula rationale:
 * - Knowledge Gain = (lead_competence / 18) × intensity_factor ± noise
 *   Divisor 18 scales 60-76 researcher competence to 3-4 knowledge per cycle.
 * - Drift Delta = (4 + intensity × 6 ± noise) × safeguard_factor
 *   Base 4 drift + scaling from intensity; safeguards apply multiplier (0.72-1.25).
 * - Strain Delta = (3 + intensity × 4 ± noise) × safeguard_factor
 *   Similar to drift; affects containment integrity.
 * - Stress Delta = 2 + intensity × 2.5 - (caution / 65) ± noise
 *   Caution reduces stress: low caution (40) → +0.38 stress; high caution (80) → -0.23.
 *
 * @param {object} state - Current game state
 * @param {object} rng - Seeded RNG for deterministic randomness
 * @returns {object} Deltas: knowledgeDelta, driftDelta, strainDelta, stressDelta, summary text
 */
function resolveExperiment(state, rng) {
  const { experiment } = state.pendingActions;
  const lead = state.staff.find((s) => s.id === experiment.leadId) || state.staff[0];
  // Intensity multipliers: low 0.6x, medium 1x, high 1.45x
  const intensityFactor = { low: 0.6, medium: 1, high: 1.45 }[experiment.intensity] || 1;
  // Safeguard multipliers: minimal 1.25x (high risk/high reward), standard 1x, reinforced 0.72x (low risk)
  const safeguardFactor = { minimal: 1.25, standard: 1, reinforced: 0.72 }[experiment.safeguards] || 1;

  const knowledgeDelta = Math.round((lead.competence / 18) * intensityFactor + randomRange(rng, 0, 2));
  const driftDelta = (4 + intensityFactor * 6 + randomRange(rng, 0, 2)) * safeguardFactor;
  const strainDelta = (3 + intensityFactor * 4 + randomRange(rng, 0, 1.2)) * safeguardFactor;
  const stressDelta = Math.round(2 + intensityFactor * 2.5 - lead.caution / 65 + randomRange(rng, 0, 2));

  return {
    knowledgeDelta,
    driftDelta,
    strainDelta,
    stressDelta,
    summary: `Experiment (${experiment.intensity}) produced +${knowledgeDelta} knowledge.`
  };
}

/**
 * Apply staff reassignment action.
 *
 * Changes staff member's role and applies +2 stress penalty for transition disruption.
 * No effect if target role matches current role.
 *
 * @param {object} state - Current game state
 * @returns {object} {staff: updated roster, changed: report text or null}
 */
function applyReassignment(state) {
  const { reassignment } = state.pendingActions;
  const staff = state.staff.map((member) => ({ ...member }));
  const target = staff.find((s) => s.id === reassignment.staffId);

  if (target && reassignment.targetRole && reassignment.targetRole !== target.role) {
    target.role = reassignment.targetRole;
    target.stress = clamp(target.stress + 2, 0, 100); // +2 stress from role change disruption
    return { staff, changed: `${target.name} reassigned to ${target.role}.` };
  }

  return { staff, changed: null };
}

/**
 * Apply protocol mode adjustment.
 *
 * Four modes with different trade-offs:
 * - tighten-containment: +4 stability, +5 power, -2 strain, -2 knowledge (safest, most expensive)
 * - reduce-power: -3 stability, -6 power, +2 strain, -1 knowledge (efficient, less stable)
 * - restrict-access: +2 stability, +1 power, +1 strain, -3 knowledge (knowledge penalty, moderate safety)
 * - balanced: 0 all (default, neutral state)
 *
 * @param {object} state - Current game state
 * @returns {object} Deltas: {stability, power, strain, knowledgePenalty, note}
 */
function applyProtocol(state) {
  const mode = state.pendingActions.protocol.mode;
  switch (mode) {
    case 'tighten-containment':
      // Maximum safety investment: high power cost, reduced strain
      return { stability: 4, power: 5, strain: -2, knowledgePenalty: -2, note: 'Containment protocols tightened.' };
    case 'reduce-power':
      // Cost-saving: reduced power draw at stability expense
      return { stability: -3, power: -6, strain: 2, knowledgePenalty: -1, note: 'Power draw reduced.' };
    case 'restrict-access':
      // Moderate safety: significant knowledge cost for modest stability
      return { stability: 2, power: 1, strain: 1, knowledgePenalty: -3, note: 'Access restrictions enacted.' };
    default:
      // Balanced: status quo, no change
      return { stability: 0, power: 0, strain: 0, knowledgePenalty: 0, note: 'Balanced posture maintained.' };
  }
}

/**
 * Generate contextual reports for the next cycle.
 *
 * Combines action summary notes (experiment, protocol, reassignment) with
 * procedurally generated reports from research/security/engineering teams.
 * Report count (1-3) and content vary based on drift level.
 *
 * @param {object} next - Updated state for the cycle (for drift context)
 * @param {number} cycle - Current cycle number (for report dating)
 * @param {object} rng - Seeded RNG for deterministic report generation
 * @param {array} notes - Action summary notes to include
 * @returns {array} Array of report objects {cycle, source, text}
 */
function createReports(next, cycle, rng, notes) {
  const templates = [
    'Sensor arrays report mild phase shear near containment ring C.',
    'Security briefing flags procedural variance between shifts.',
    'Engineering notes intermittent power harmonics under observation load.',
    'Research memo suggests additional data quality audits next cycle.',
    'Operations summary indicates anomaly response remains within expected envelope.'
  ];

  const reports = [...notes]
    .filter(Boolean)
    .map((text) => ({ cycle, source: 'Directorate Log', text }));

  const amount = randomInt(rng, 1, 3);
  for (let i = 0; i < amount; i += 1) {
    const noise = next.anomaly.driftLevel > 55 ? 'Conflicting values detected in annex.' : 'Confidence moderate.';
    reports.push({ cycle, source: pick(rng, ['Research', 'Security', 'Engineering']), text: `${pick(rng, templates)} ${noise}` });
  }

  return reports;
}

/**
 * Main simulation function: resolve all pending actions and advance one cycle.
 *
 * Pipeline:
 * 1. Resolve experiment (knowledge, drift, strain, stress outcomes)
 * 2. Apply protocol mode (stability, power, strain, knowledge adjustments)
 * 3. Apply reassignments (role change, stress penalty)
 * 4. Calculate composite effects (role balance drift pressure, instability noise)
 * 5. Update all metrics with deltas and constraints
 * 6. Apply staff-wide stress changes
 * 7. Generate reports for the cycle
 *
 * All randomness uses seeded RNG for deterministic replay.
 *
 * @param {object} state - Current game state
 * @returns {object} New state with cycle incremented and all metrics updated
 */
export function simulateCycle(state) {
  // Seed RNG: each cycle gets a unique but deterministic seed
  const rng = createRng(state.meta.seed + state.meta.cycle);

  const roleCounts = getRoleCounts(state.staff);
  const clarityBonus = state.pendingActions.clarification.enabled ? 3 : 0;

  // Resolve pending actions
  const experimentOutcome = resolveExperiment(state, rng);
  const protocolOutcome = applyProtocol(state);
  const reassignment = applyReassignment(state);

  // Composite effects and noise
  const baseInstability = randomRange(rng, -1.2, 1.8); // Random chaos in the anomaly
  // Role imbalance penalty: each excess researcher vs. security increases drift by 0.7
  const driftPressure = experimentOutcome.driftDelta + Math.max(0, roleCounts.research - roleCounts.security) * 0.7;

  const next = {
    ...state,
    meta: {
      ...state.meta,
      cycle: state.meta.cycle + 1
    },
    staff: reassignment.staff,
    site: {
      // Containment Stability: affected by protocol (+4 for tighten), drift pressure (-0.18× per drift), base chaos
      containmentStability: clamp(
        state.site.containmentStability + protocolOutcome.stability - driftPressure * 0.18 - baseInstability + clarityBonus * 0.4
      ),
      // Power Load: protocol adjustments, experiment stress, random variation
      powerLoad: clamp(state.site.powerLoad + protocolOutcome.power + experimentOutcome.driftDelta * 0.12 + randomRange(rng, -1, 1)),
      // Containment Integrity: strained by experiments and high drift (> 65)
      containmentIntegrity: clamp(
        state.site.containmentIntegrity - experimentOutcome.strainDelta * 0.22 - Math.max(0, state.anomaly.driftLevel - 65) * 0.04
      )
    },
    anomaly: {
      ...state.anomaly,
      // Drift: increases with experiments, reduced by clarification requests
      driftLevel: clamp(state.anomaly.driftLevel + experimentOutcome.driftDelta - clarityBonus * 0.7),
      // Strain: accumulates from experiments and bad protocols
      containmentStrain: clamp(state.anomaly.containmentStrain + experimentOutcome.strainDelta + protocolOutcome.strain),
      // Observation Pressure: grows by 0.8 per action slot (3 max per cycle)
      observationPressure: clamp(state.anomaly.observationPressure + ACTION_LIMIT_PER_CYCLE * 0.8 + randomRange(rng, -1.1, 1.2)),
      // Knowledge: cumulative research progress, penalties from restrictive protocols
      knowledgeGained: Math.max(0, state.anomaly.knowledgeGained + experimentOutcome.knowledgeDelta + protocolOutcome.knowledgePenalty)
    }
  };

  // Lead researcher stress: affected by experiment intensity and caution
  const lead = next.staff.find((s) => s.id === state.pendingActions.experiment.leadId);
  if (lead) {
    lead.stress = clamp(lead.stress + experimentOutcome.stressDelta);
  }

  // Supporting staff stress: lower if clarification request improves conditions
  const supportStressDelta = state.pendingActions.clarification.enabled ? 1 : 2;
  next.staff = next.staff.map((member) => ({ ...member, stress: clamp(member.stress + randomRange(rng, 0, supportStressDelta)) }));

  // Generate reports summarizing cycle actions and procedurally generated updates
  const notes = [experimentOutcome.summary, protocolOutcome.note, reassignment.changed];
  next.reports = [...state.reports, ...createReports(next, next.meta.cycle, rng, notes)].slice(-60);

  return next;
}

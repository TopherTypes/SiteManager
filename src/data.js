/**
 * Constants, configuration, and baseline domain data for Site Director simulation.
 *
 * This module serves as the single source of truth for game configuration,
 * staff roster attributes, action definitions, and default game state.
 * Modifying these values directly affects simulation behavior and difficulty.
 */

export const STORAGE_KEY = 'site-director-mvp-state-v0';

export const ACTION_LIMIT_PER_CYCLE = 3;

export const DEFAULT_SEED = 130021;

export const ROLES = ['research', 'security', 'engineering'];

/**
 * Initial staff roster for a new game.
 *
 * Attributes:
 * - competence (0-100): Raw ability at their current role; affects experiment knowledge gain
 * - caution (0-100): Tendency toward risk-averse decisions; reduces stress delta and drift impact
 * - stress (0-100): Current fatigue level; increases with high-intensity actions, affects decision quality
 *
 * Staff are balanced across roles to encourage varied strategies in early cycles.
 */
export const STAFF_BASE = [
  { id: 's-1', name: 'Dr. Vale', role: 'research', competence: 76, caution: 58, stress: 22 },
  { id: 's-2', name: 'Dr. Morrow', role: 'research', competence: 69, caution: 72, stress: 26 },
  { id: 's-3', name: 'Lt. Harker', role: 'security', competence: 67, caution: 81, stress: 20 },
  { id: 's-4', name: 'Officer Imani', role: 'security', competence: 61, caution: 74, stress: 18 },
  { id: 's-5', name: 'Eng. Cho', role: 'engineering', competence: 73, caution: 64, stress: 24 }
];

export const DEFAULT_STATE = {
  meta: {
    version: '0.1.0',
    seed: DEFAULT_SEED,
    cycle: 0
  },
  site: {
    containmentStability: 83,
    powerLoad: 54,
    containmentIntegrity: 87
  },
  anomaly: {
    id: 'A-01',
    title: 'The Discrepancy Field',
    driftLevel: 16,
    containmentStrain: 18,
    observationPressure: 12,
    knowledgeGained: 0
  },
  staff: STAFF_BASE,
  reports: [
    {
      cycle: 0,
      source: 'System Intake',
      text: 'A-01 remains contained. Baseline drift signatures are low but non-zero.'
    }
  ],
  pendingActions: {
    experiment: {
      leadId: 's-1',
      intensity: 'medium',
      safeguards: 'standard'
    },
    reassignment: {
      staffId: 's-5',
      targetRole: 'engineering'
    },
    protocol: {
      mode: 'balanced'
    },
    clarification: {
      enabled: false
    }
  }
};

export const EXPERIMENT_INTENSITY = ['low', 'medium', 'high'];
export const SAFEGUARDS = ['minimal', 'standard', 'reinforced'];
export const PROTOCOL_MODES = ['balanced', 'tighten-containment', 'reduce-power', 'restrict-access'];

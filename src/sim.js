import { ACTION_LIMIT_PER_CYCLE } from './data.js';
import { createRng, randomInt, randomRange } from './utils/rng.js';

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pick(rng, items) {
  return items[randomInt(rng, 0, items.length - 1)];
}

function getRoleCounts(staff) {
  return staff.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    { research: 0, security: 0, engineering: 0 }
  );
}

function resolveExperiment(state, rng) {
  const { experiment } = state.pendingActions;
  const lead = state.staff.find((s) => s.id === experiment.leadId) || state.staff[0];
  const intensityFactor = { low: 0.6, medium: 1, high: 1.45 }[experiment.intensity] || 1;
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

function applyReassignment(state) {
  const { reassignment } = state.pendingActions;
  const staff = state.staff.map((member) => ({ ...member }));
  const target = staff.find((s) => s.id === reassignment.staffId);

  if (target && reassignment.targetRole && reassignment.targetRole !== target.role) {
    target.role = reassignment.targetRole;
    target.stress = clamp(target.stress + 2, 0, 100);
    return { staff, changed: `${target.name} reassigned to ${target.role}.` };
  }

  return { staff, changed: null };
}

function applyProtocol(state) {
  const mode = state.pendingActions.protocol.mode;
  switch (mode) {
    case 'tighten-containment':
      return { stability: 4, power: 5, strain: -2, knowledgePenalty: -2, note: 'Containment protocols tightened.' };
    case 'reduce-power':
      return { stability: -3, power: -6, strain: 2, knowledgePenalty: -1, note: 'Power draw reduced.' };
    case 'restrict-access':
      return { stability: 2, power: 1, strain: 1, knowledgePenalty: -3, note: 'Access restrictions enacted.' };
    default:
      return { stability: 0, power: 0, strain: 0, knowledgePenalty: 0, note: 'Balanced posture maintained.' };
  }
}

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

export function simulateCycle(state) {
  const rng = createRng(state.meta.seed + state.meta.cycle);

  const roleCounts = getRoleCounts(state.staff);
  const clarityBonus = state.pendingActions.clarification.enabled ? 3 : 0;

  const experimentOutcome = resolveExperiment(state, rng);
  const protocolOutcome = applyProtocol(state);
  const reassignment = applyReassignment(state);

  const baseInstability = randomRange(rng, -1.2, 1.8);
  const driftPressure = experimentOutcome.driftDelta + Math.max(0, roleCounts.research - roleCounts.security) * 0.7;

  const next = {
    ...state,
    meta: {
      ...state.meta,
      cycle: state.meta.cycle + 1
    },
    staff: reassignment.staff,
    site: {
      containmentStability: clamp(
        state.site.containmentStability + protocolOutcome.stability - driftPressure * 0.18 - baseInstability + clarityBonus * 0.4
      ),
      powerLoad: clamp(state.site.powerLoad + protocolOutcome.power + experimentOutcome.driftDelta * 0.12 + randomRange(rng, -1, 1)),
      containmentIntegrity: clamp(
        state.site.containmentIntegrity - experimentOutcome.strainDelta * 0.22 - Math.max(0, state.anomaly.driftLevel - 65) * 0.04
      )
    },
    anomaly: {
      ...state.anomaly,
      driftLevel: clamp(state.anomaly.driftLevel + experimentOutcome.driftDelta - clarityBonus * 0.7),
      containmentStrain: clamp(state.anomaly.containmentStrain + experimentOutcome.strainDelta + protocolOutcome.strain),
      observationPressure: clamp(state.anomaly.observationPressure + ACTION_LIMIT_PER_CYCLE * 0.8 + randomRange(rng, -1.1, 1.2)),
      knowledgeGained: Math.max(0, state.anomaly.knowledgeGained + experimentOutcome.knowledgeDelta + protocolOutcome.knowledgePenalty)
    }
  };

  const lead = next.staff.find((s) => s.id === state.pendingActions.experiment.leadId);
  if (lead) {
    lead.stress = clamp(lead.stress + experimentOutcome.stressDelta);
  }

  const supportStressDelta = state.pendingActions.clarification.enabled ? 1 : 2;
  next.staff = next.staff.map((member) => ({ ...member, stress: clamp(member.stress + randomRange(rng, 0, supportStressDelta)) }));

  const notes = [experimentOutcome.summary, protocolOutcome.note, reassignment.changed];
  next.reports = [...state.reports, ...createReports(next, next.meta.cycle, rng, notes)].slice(-60);

  return next;
}

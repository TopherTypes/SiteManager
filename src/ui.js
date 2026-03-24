import {
  ACTION_LIMIT_PER_CYCLE,
  EXPERIMENT_INTENSITY,
  PROTOCOL_MODES,
  ROLES,
  SAFEGUARDS
} from './data.js';

function byId(id) {
  return document.getElementById(id);
}

function percentWithNoise(value, noise) {
  const rough = Math.round(value + noise);
  return `${Math.max(0, Math.min(100, rough))}%`;
}

function stressBand(value) {
  if (value >= 70) return 'high';
  if (value >= 35) return 'medium';
  return 'low';
}

function renderTopMetrics(state) {
  const host = byId('top-metrics');
  const approxNoise = state.anomaly.driftLevel / 18;

  host.innerHTML = [
    ['Cycle', String(state.meta.cycle)],
    ['Containment Stability', percentWithNoise(state.site.containmentStability, approxNoise)],
    ['Power Load', percentWithNoise(state.site.powerLoad, approxNoise * 0.65)],
    ['Avg Staff Stress', stressBand(state.staff.reduce((a, s) => a + s.stress, 0) / state.staff.length)],
    ['Research Progress', `${Math.round(state.anomaly.knowledgeGained)} KP`]
  ]
    .map(
      ([label, value]) =>
        `<div class="metric"><div class="label">${label}</div><div><strong>${value}</strong></div></div>`
    )
    .join('');
}

function renderReports(state) {
  const host = byId('reports-feed');
  const items = state.reports.slice(-16).reverse();
  host.innerHTML = items
    .map(
      (report) =>
        `<article class="report"><div class="meta">Cycle ${report.cycle} · ${report.source}</div><p>${report.text}</p></article>`
    )
    .join('');
}

function riskBadge(state) {
  const critical = state.site.containmentStability < 40 || state.site.containmentIntegrity < 45 || state.anomaly.driftLevel > 70;
  return critical ? '<span class="badge-danger">Critical risk trend</span>' : '<span class="badge-ok">Contained (watchlist)</span>';
}

function renderCenterStatus(state) {
  const host = byId('center-status');
  host.innerHTML = `
    <div class="data-grid">
      <div class="kv"><div class="k">Anomaly</div><div>${state.anomaly.id}: ${state.anomaly.title}</div></div>
      <div class="kv"><div class="k">Risk Posture</div><div>${riskBadge(state)}</div></div>
      <div class="kv"><div class="k">Drift Level</div><div>${Math.round(state.anomaly.driftLevel)}</div></div>
      <div class="kv"><div class="k">Containment Strain</div><div>${Math.round(state.anomaly.containmentStrain)}</div></div>
      <div class="kv"><div class="k">Observation Pressure</div><div>${Math.round(state.anomaly.observationPressure)}</div></div>
      <div class="kv"><div class="k">Containment Integrity</div><div>${Math.round(state.site.containmentIntegrity)}%</div></div>
    </div>
  `;
}

function optionList(values, selected) {
  return values
    .map((value) => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value}</option>`)
    .join('');
}

export function renderUI(state) {
  renderTopMetrics(state);
  renderReports(state);
  renderCenterStatus(state);

  const actions = byId('actions');
  const leadOptions = state.staff
    .filter((s) => s.role === 'research')
    .map((s) => `<option value="${s.id}" ${s.id === state.pendingActions.experiment.leadId ? 'selected' : ''}>${s.name}</option>`)
    .join('');

  const reassignmentOptions = state.staff
    .map((s) => `<option value="${s.id}" ${s.id === state.pendingActions.reassignment.staffId ? 'selected' : ''}>${s.name}</option>`)
    .join('');

  actions.innerHTML = `
    <div class="actions-grid">
      <section class="action-card">
        <h3>Authorize Experiment</h3>
        <label>Lead Researcher
          <select id="exp-lead">${leadOptions}</select>
        </label>
        <label>Intensity
          <select id="exp-intensity">${optionList(EXPERIMENT_INTENSITY, state.pendingActions.experiment.intensity)}</select>
        </label>
        <label>Safeguards
          <select id="exp-safeguards">${optionList(SAFEGUARDS, state.pendingActions.experiment.safeguards)}</select>
        </label>
      </section>

      <section class="action-card">
        <h3>Reassign Staff</h3>
        <label>Member
          <select id="reassign-staff">${reassignmentOptions}</select>
        </label>
        <label>Target Role
          <select id="reassign-role">${optionList(ROLES, state.pendingActions.reassignment.targetRole)}</select>
        </label>
      </section>

      <section class="action-card">
        <h3>Adjust Protocol</h3>
        <label>Mode
          <select id="protocol-mode">${optionList(PROTOCOL_MODES, state.pendingActions.protocol.mode)}</select>
        </label>
      </section>

      <section class="action-card">
        <h3>Request Clarification</h3>
        <label>
          <input id="clarification-toggle" type="checkbox" ${state.pendingActions.clarification.enabled ? 'checked' : ''} />
          Spend 1 action slot to improve next-cycle information reliability.
        </label>
      </section>
    </div>
  `;

  const selectedActions = [
    'Experiment authorization',
    'Staff reassignment',
    'Protocol adjustment',
    state.pendingActions.clarification.enabled ? 'Clarification request' : null
  ].filter(Boolean);

  byId('action-summary').textContent = `Selected actions: ${Math.min(
    selectedActions.length,
    ACTION_LIMIT_PER_CYCLE
  )}/${ACTION_LIMIT_PER_CYCLE}. ${selectedActions.join(' · ')}`;
}

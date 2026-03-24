/**
 * UI rendering and event binding layer.
 *
 * Responsibilities:
 * - Render all DOM elements: metrics, reports, action forms, status displays
 * - Apply information obscuration: add noise to player-visible values based on drift level
 * - Display risk assessments and thresholds to guide player decisions
 * - Manage window dragging and window state
 *
 * Design Philosophy:
 * The UI intentionally displays approximations, not true internal values.
 * As drift level increases, unreliability increases, reflecting the anomaly's
 * destabilizing effects on observation and reporting accuracy.
 */

import {
  ACTION_LIMIT_PER_CYCLE,
  EXPERIMENT_INTENSITY,
  PROTOCOL_MODES,
  ROLES,
  SAFEGUARDS
} from './data.js';

/**
 * Convenience wrapper for document.getElementById.
 */
function byId(id) {
  return document.getElementById(id);
}

/**
 * Format a value as a percentage with random noise.
 */
function percentWithNoise(value, noise) {
  const rough = Math.round(value + noise);
  return `${Math.max(0, Math.min(100, rough))}%`;
}

/**
 * Classify stress level into visual categories.
 */
function stressBand(value) {
  if (value >= 70) return 'high';
  if (value >= 35) return 'medium';
  return 'low';
}

/**
 * Render top metrics bar.
 */
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
        `<div class="metric"><div class="label">${label}</div><div class="value">${value}</div></div>`
    )
    .join('');
}

/**
 * Render the reports feed as an email table.
 */
function renderReports(state) {
  const host = byId('reports-feed');
  const items = state.reports.slice(-16).reverse();

  host.innerHTML = items
    .map((report) => {
      // Extract first few words as subject line
      const words = report.text.split(' ');
      const subject = words.slice(0, Math.min(5, words.length)).join(' ') + (words.length > 5 ? '...' : '');

      // Abbreviate source for email "from" field
      const fromMap = {
        'Research': 'RESEARCH',
        'Security': 'SEC OPS',
        'Engineering': 'ENG'
      };
      const from = fromMap[report.source] || report.source.toUpperCase();

      return `
        <tr class="email-row" data-cycle="${report.cycle}" title="${report.text}">
          <td class="email-from">${from}</td>
          <td class="email-subject">${subject}</td>
          <td class="email-time">C${report.cycle}</td>
        </tr>
      `;
    })
    .join('');
}

/**
 * Generate a risk assessment badge.
 */
function riskBadge(state) {
  const critical = state.site.containmentStability < 40 || state.site.containmentIntegrity < 45 || state.anomaly.driftLevel > 70;
  return critical ? '<span class="badge-danger">⚠ CRITICAL</span>' : '<span class="badge-ok">✓ STABLE</span>';
}

/**
 * Render anomaly and system status.
 */
function renderCenterStatus(state) {
  const host = byId('center-status');
  host.innerHTML = `
    <div class="data-grid">
      <div class="kv"><div class="k">ANOMALY</div><div>${state.anomaly.id}: ${state.anomaly.title}</div></div>
      <div class="kv"><div class="k">STATUS</div><div>${riskBadge(state)}</div></div>
      <div class="kv"><div class="k">DRIFT</div><div>${Math.round(state.anomaly.driftLevel)}</div></div>
      <div class="kv"><div class="k">STRAIN</div><div>${Math.round(state.anomaly.containmentStrain)}</div></div>
      <div class="kv"><div class="k">PRESSURE</div><div>${Math.round(state.anomaly.observationPressure)}</div></div>
      <div class="kv"><div class="k">INTEGRITY</div><div>${Math.round(state.site.containmentIntegrity)}%</div></div>
    </div>
  `;
}

function optionList(values, selected) {
  return values
    .map((value) => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value}</option>`)
    .join('');
}

/**
 * Main render entry point: update all UI elements with current state.
 */
export function renderUI(state) {
  renderTopMetrics(state);
  renderReports(state);
  renderCenterStatus(state);

  // Experiment window
  const leadOptions = state.staff
    .filter((s) => s.role === 'research')
    .map((s) => `<option value="${s.id}" ${s.id === state.pendingActions.experiment.leadId ? 'selected' : ''}>${s.name}</option>`)
    .join('');

  byId('actions-experiment').innerHTML = `
    <div class="action-card">
      <h3>Authorize Experiment</h3>
      <div class="form-group">
        <label>Lead Researcher</label>
        <select id="exp-lead">${leadOptions}</select>
      </div>
      <div class="form-group">
        <label>Intensity</label>
        <select id="exp-intensity">${optionList(EXPERIMENT_INTENSITY, state.pendingActions.experiment.intensity)}</select>
      </div>
      <div class="form-group">
        <label>Safeguards</label>
        <select id="exp-safeguards">${optionList(SAFEGUARDS, state.pendingActions.experiment.safeguards)}</select>
      </div>
    </div>
  `;

  // Staff window
  const reassignmentOptions = state.staff
    .map((s) => `<option value="${s.id}" ${s.id === state.pendingActions.reassignment.staffId ? 'selected' : ''}>${s.name}</option>`)
    .join('');

  byId('actions-staff').innerHTML = `
    <div class="action-card">
      <h3>Reassign Staff</h3>
      <div class="form-group">
        <label>Member</label>
        <select id="reassign-staff">${reassignmentOptions}</select>
      </div>
      <div class="form-group">
        <label>Target Role</label>
        <select id="reassign-role">${optionList(ROLES, state.pendingActions.reassignment.targetRole)}</select>
      </div>
    </div>
  `;

  // Protocol window
  byId('actions-protocol').innerHTML = `
    <div class="action-card">
      <h3>Adjust Protocol</h3>
      <div class="form-group">
        <label>Mode</label>
        <select id="protocol-mode">${optionList(PROTOCOL_MODES, state.pendingActions.protocol.mode)}</select>
      </div>
    </div>
  `;

  // Clarification window
  byId('actions-clarification').innerHTML = `
    <div class="action-card">
      <h3>Request Clarification</h3>
      <div class="form-group">
        <label>
          <input id="clarification-toggle" type="checkbox" ${state.pendingActions.clarification.enabled ? 'checked' : ''} />
          Spend 1 slot to improve reliability
        </label>
      </div>
    </div>
  `;

  // Action summary
  const selectedActions = [
    'Experiment authorization',
    'Staff reassignment',
    'Protocol adjustment',
    state.pendingActions.clarification.enabled ? 'Clarification request' : null
  ].filter(Boolean);

  byId('action-summary').textContent = `SELECTED: ${Math.min(
    selectedActions.length,
    ACTION_LIMIT_PER_CYCLE
  )}/${ACTION_LIMIT_PER_CYCLE} · ${selectedActions.join(' | ')}`;

  // Update taskbar clock
  updateTaskbarClock();
}

/**
 * Window Management System
 */

let draggedWindow = null;
let dragOffset = { x: 0, y: 0 };

/**
 * Initialize window dragging.
 */
export function initializeWindowDragging() {
  document.addEventListener('mousedown', (e) => {
    const titleBar = e.target.closest('.window-title-bar');
    if (!titleBar) return;

    draggedWindow = titleBar.closest('.window');
    const rect = draggedWindow.getBoundingClientRect();
    dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    draggedWindow.classList.add('focused');
    raiseWindowToTop(draggedWindow);
  });

  document.addEventListener('mousemove', (e) => {
    if (!draggedWindow) return;

    draggedWindow.style.left = (e.clientX - dragOffset.x) + 'px';
    draggedWindow.style.top = (e.clientY - dragOffset.y) + 'px';
  });

  document.addEventListener('mouseup', () => {
    draggedWindow = null;
  });
}

/**
 * Raise window to top when clicked.
 */
export function raiseWindowToTop(windowEl) {
  const windows = document.querySelectorAll('.window');
  let maxZ = 100;

  windows.forEach(w => {
    const z = parseInt(window.getComputedStyle(w).zIndex) || 100;
    if (z > maxZ) maxZ = z;
    w.classList.remove('focused');
  });

  windowEl.style.zIndex = maxZ + 1;
  windowEl.classList.add('focused');
}

/**
 * Initialize window control buttons.
 */
export function initializeWindowControls() {
  // Minimize/close/maximize buttons
  document.querySelectorAll('.window-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const windowId = btn.dataset.window;
      const windowEl = byId(windowId + '-window');

      if (action === 'minimize') {
        windowEl.classList.add('minimized');
        // Update taskbar button
        const taskbarBtn = document.querySelector(`[data-toggle-window="${windowId}-window"]`);
        if (taskbarBtn) taskbarBtn.classList.remove('active');
      } else if (action === 'close') {
        windowEl.classList.add('minimized');
        const taskbarBtn = document.querySelector(`[data-toggle-window="${windowId}-window"]`);
        if (taskbarBtn) taskbarBtn.classList.remove('active');
      } else if (action === 'maximize') {
        // Simple maximization (could be enhanced)
        windowEl.style.width = '80vw';
        windowEl.style.height = '80vh';
        windowEl.style.left = '10vw';
        windowEl.style.top = '40px';
      }
    });
  });

  // Taskbar window toggle buttons
  document.querySelectorAll('[data-toggle-window]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const windowId = btn.dataset.toggleWindow;
      const windowEl = byId(windowId);

      if (windowEl.classList.contains('minimized')) {
        windowEl.classList.remove('minimized');
        btn.classList.add('active');
        raiseWindowToTop(windowEl);
      } else {
        windowEl.classList.add('minimized');
        btn.classList.remove('active');
      }
    });
  });
}

/**
 * Update taskbar clock every second.
 */
export function updateTaskbarClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const clockEl = byId('taskbar-time');
  if (clockEl) clockEl.textContent = timeStr;
}

/**
 * Set up periodic clock updates.
 */
export function startClockUpdates() {
  setInterval(updateTaskbarClock, 1000);
}

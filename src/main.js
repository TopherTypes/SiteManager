/**
 * Application bootstrap and event orchestration.
 *
 * Responsibilities:
 * - Initialize game state from localStorage on page load
 * - Synchronize DOM form inputs with pending action state (bidirectional binding)
 * - Wire event handlers for form changes and button clicks
 * - Orchestrate the state → simulate → render → save pipeline
 *
 * The main event loop flow:
 * 1. User modifies a form input
 * 2. syncPendingFromDom() reads form values into state.pendingActions
 * 3. state is saved to localStorage
 * 4. renderUI() re-renders the UI with updated state
 * 5. On "Commit Cycle": simulateCycle() advances the game, repeat
 */

import { loadState, resetState, saveState } from './state.js';
import { simulateCycle } from './sim.js';
import { renderUI, initializeWindowDragging, initializeWindowControls, startClockUpdates } from './ui.js';

let state = loadState();

/**
 * Synchronize form input values from DOM into state.pendingActions.
 *
 * Called whenever a form input changes to keep in-memory state in sync with UI.
 * Ensures that when "Commit Cycle" is clicked, all pending actions reflect
 * the user's current form selections.
 */
function syncPendingFromDom() {
  state.pendingActions.experiment.leadId = document.getElementById('exp-lead').value;
  state.pendingActions.experiment.intensity = document.getElementById('exp-intensity').value;
  state.pendingActions.experiment.safeguards = document.getElementById('exp-safeguards').value;

  state.pendingActions.reassignment.staffId = document.getElementById('reassign-staff').value;
  state.pendingActions.reassignment.targetRole = document.getElementById('reassign-role').value;

  state.pendingActions.protocol.mode = document.getElementById('protocol-mode').value;
  state.pendingActions.clarification.enabled = document.getElementById('clarification-toggle').checked;
}

function rerenderAndBind() {
  renderUI(state);

  const bindIds = [
    'exp-lead',
    'exp-intensity',
    'exp-safeguards',
    'reassign-staff',
    'reassign-role',
    'protocol-mode',
    'clarification-toggle'
  ];

  // Bind form inputs: update state, persist, and re-render on every change
  bindIds.forEach((id) => {
    const eventName = id === 'clarification-toggle' ? 'change' : 'input';
    document.getElementById(id).addEventListener(eventName, () => {
      syncPendingFromDom();
      saveState(state);
      renderUI(state);
    });
  });

  // Commit Cycle: resolve all pending actions via simulation, save progress, re-render
  document.getElementById('commit-cycle').addEventListener('click', () => {
    syncPendingFromDom();
    state = simulateCycle(state);
    saveState(state);
    rerenderAndBind();
  });

  // Reset Save: clear localStorage and return to fresh game state
  document.getElementById('reset-save').addEventListener('click', () => {
    state = resetState();
    saveState(state);
    rerenderAndBind();
  });

  // Initialize window management
  initializeWindowControls();
  initializeWindowDragging();
}

rerenderAndBind();
startClockUpdates();

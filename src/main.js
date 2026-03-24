import { loadState, resetState, saveState } from './state.js';
import { simulateCycle } from './sim.js';
import { renderUI } from './ui.js';

let state = loadState();

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

  bindIds.forEach((id) => {
    const eventName = id === 'clarification-toggle' ? 'change' : 'input';
    document.getElementById(id).addEventListener(eventName, () => {
      syncPendingFromDom();
      saveState(state);
      renderUI(state);
    });
  });

  document.getElementById('commit-cycle').addEventListener('click', () => {
    syncPendingFromDom();
    state = simulateCycle(state);
    saveState(state);
    rerenderAndBind();
  });

  document.getElementById('reset-save').addEventListener('click', () => {
    state = resetState();
    saveState(state);
    rerenderAndBind();
  });
}

rerenderAndBind();

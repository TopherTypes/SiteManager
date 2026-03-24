import { DEFAULT_STATE, STAFF_BASE, STORAGE_KEY } from './data.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeState(raw) {
  const base = clone(DEFAULT_STATE);
  if (!raw || typeof raw !== 'object') return base;

  return {
    ...base,
    ...raw,
    meta: { ...base.meta, ...(raw.meta || {}) },
    site: { ...base.site, ...(raw.site || {}) },
    anomaly: { ...base.anomaly, ...(raw.anomaly || {}) },
    staff: Array.isArray(raw.staff) && raw.staff.length ? raw.staff : clone(STAFF_BASE),
    reports: Array.isArray(raw.reports) ? raw.reports : clone(base.reports),
    pendingActions: {
      ...base.pendingActions,
      ...(raw.pendingActions || {}),
      experiment: {
        ...base.pendingActions.experiment,
        ...((raw.pendingActions && raw.pendingActions.experiment) || {})
      },
      reassignment: {
        ...base.pendingActions.reassignment,
        ...((raw.pendingActions && raw.pendingActions.reassignment) || {})
      },
      protocol: {
        ...base.pendingActions.protocol,
        ...((raw.pendingActions && raw.pendingActions.protocol) || {})
      },
      clarification: {
        ...base.pendingActions.clarification,
        ...((raw.pendingActions && raw.pendingActions.clarification) || {})
      }
    }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    return normalizeState(JSON.parse(raw));
  } catch {
    // If persisted state is corrupted/unreadable, recover with defaults.
    return clone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return clone(DEFAULT_STATE);
}

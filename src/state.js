/**
 * State management and persistence layer for Site Director.
 *
 * Responsibilities:
 * - Load/save game state from/to browser localStorage
 * - Normalize state from corrupted saves (merge with defaults, restore missing fields)
 * - Provide defensive recovery when localStorage is unavailable or contains invalid data
 *
 * The persistence strategy uses deep cloning to avoid mutations from localStorage references,
 * ensuring immutable state for reliable simulation determinism.
 */

import { DEFAULT_STATE, STAFF_BASE, STORAGE_KEY } from './data.js';

/**
 * Deep clone an object using JSON serialization.
 *
 * Necessary to isolate state from localStorage mutations and ensure
 * immutable updates throughout the application lifecycle.
 *
 * @param {*} value - Any JSON-serializable value
 * @returns {*} A deep clone of the input value
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Merge a potentially corrupted or incomplete state with defaults.
 *
 * Uses a nested merge strategy to preserve loaded values while restoring
 * any missing or undefined properties from the default state. This ensures
 * forward compatibility if new properties are added in future versions.
 *
 * @param {object} raw - Parsed state object from localStorage (may be incomplete or invalid)
 * @returns {object} Safe, complete state object with all required properties
 */
function normalizeState(raw) {
  const base = clone(DEFAULT_STATE);
  if (!raw || typeof raw !== 'object') return base;

  // Deep merge strategy: provide defaults for each nested object to handle
  // partial saves, version mismatches, and missing properties gracefully.
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

/**
 * Load game state from browser localStorage.
 *
 * Returns a fresh default state if localStorage is empty or corrupted.
 * All loaded states are normalized to ensure compatibility.
 *
 * @returns {object} Complete, normalized game state
 */
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

/**
 * Persist game state to browser localStorage.
 *
 * @param {object} state - Complete game state to save
 */
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Clear localStorage and return a fresh default game state.
 *
 * @returns {object} Fresh default state (same as initial game setup)
 */
export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return clone(DEFAULT_STATE);
}

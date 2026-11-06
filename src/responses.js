// Client-submitted intake form answers, one record per package.
// Online: stored on the server (visible on every device, updated live). Demo mode: localStorage.
import * as api from './api.js';
import { ui } from './state.js';

const LS = 'headchange_responses_v1';
export const store = {}; // { [pkgId]: { answers, name, email, submittedAt, updatedAt, snapshot } }

const replace = (obj) => { Object.keys(store).forEach((k) => delete store[k]); Object.assign(store, obj || {}); };

export async function loadResponses() {
  if (ui.apiAvailable) {
    const r = await api.fetchResponses();
    if (r) replace(r);
  } else {
    try { replace(JSON.parse(localStorage.getItem(LS) || '{}')); } catch { replace({}); }
  }
}

export async function submitResponse(pkgId, payload) {
  const now = new Date().toISOString();
  if (ui.apiAvailable) {
    const r = await api.saveResponse(pkgId, payload);
    if (!r?.response) return false;
    store[pkgId] = r.response;
    return true;
  }
  const prev = store[pkgId];
  store[pkgId] = { ...payload, submittedAt: prev?.submittedAt || now, updatedAt: now };
  localStorage.setItem(LS, JSON.stringify(store));
  return true;
}

export async function clearResponse(pkgId) {
  if (ui.apiAvailable) {
    if (!(await api.deleteResponse(pkgId, ui.token))) return false;
  }
  delete store[pkgId];
  if (!ui.apiAvailable) localStorage.setItem(LS, JSON.stringify(store));
  return true;
}

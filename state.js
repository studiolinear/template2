import { defaultPackages, defaultTemplates, defaultMonths, defaultWaiting, defaultMeta, defaultScopeTemplates, defaultWeeklyTemplates } from './data.js';
import * as api from './api.js';
import { toast } from './ui/toast.js';

export const LS_KEY = 'headchange_dashboard_v2';
export const TOKEN_KEY = 'headchange_admin_token';

// Transient UI state (never saved)
export const ui = {
  mode: 'client', // 'admin' | 'client'
  apiAvailable: false,
  token: null,
  activePackageId: null,
  ganttFilter: 'all',
  activeTab: 'scope',
  drawerPkgId: null,
  builderTemplateId: null,
  tmplTab: 'scope',
  picks: {}, // template dropdown choices (not saved)
  drafts: {}, // unsaved intake answers per package: { [pkgId]: { name, email, answers } }
};

// Persisted project state
export const state = {};

const clone = (o) => JSON.parse(JSON.stringify(o));
let uidN = 0;
export const uid = (p) => `${p}-${Date.now().toString(36)}${(uidN++).toString(36)}`;

// Older saved data used flat `fields`; convert to sections/questions.
function migrateTemplates(list) {
  list.forEach((t) => {
    if (!t.sections) {
      t.sections = [{
        id: uid('sec'), title: 'Questions', description: '',
        questions: (t.fields || []).map((f) => ({ id: uid('q'), type: 'textarea', label: f.label, required: false, options: [] })),
      }];
    }
    delete t.fields;
  });
}

export function applyState(incoming) {
  const base = {
    packages: clone(defaultPackages),
    templates: clone(defaultTemplates),
    waiting: clone(defaultWaiting),
    months: clone(defaultMonths),
    currentWeek: 19,
    meta: clone(defaultMeta),
    kpiOrder: [],
    theme: { color: '#e53935' },
    logo: '',
    scopeTemplates: clone(defaultScopeTemplates),
    weeklyTemplates: clone(defaultWeeklyTemplates),
  };
  const s = incoming || {};
  Object.assign(state, base, s);
  state.meta = { ...base.meta, ...(s.meta || {}) };
  state.theme = { ...base.theme, ...(s.theme || {}) };
  migrateTemplates(state.templates);
  recalc();
  if (!state.packages.some((p) => p.id === ui.activePackageId)) {
    ui.activePackageId = state.packages[0]?.id ?? null;
  }
}

export const totalWeeks = () => state.months.reduce((acc, m) => acc + m.weeksCount, 0);

// Numbering follows list order; completion % and status are derived from scope + current week.
export function recalc() {
  state.packages.forEach((pkg, i) => {
    pkg.number = String(i + 1);
    const total = pkg.scope.length;
    const done = pkg.scope.filter((s) => s.completed).length;
    pkg.percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    if (total > 0 && done === total) pkg.status = 'completed';
    else if (done > 0) pkg.status = 'in-progress';
    else if (pkg.startWeek <= state.currentWeek && pkg.endWeek >= state.currentWeek) pkg.status = 'in-progress';
    else if (pkg.startWeek > state.currentWeek) pkg.status = 'upcoming';
    else pkg.status = 'in-progress'; // past its end week with nothing done = overdue, not complete

    // Manual switch (package header): amber "Waiting on client" unless the package is already complete
    if (pkg.waiting && pkg.status !== 'completed') pkg.status = 'waiting';
  });
}

// ---------- Undo / redo ----------
// Every persist() compares the new state with the last one; if it changed, the old one goes on the undo stack.
// Logo and theme are excluded (large / cosmetic) and are kept as-is when undoing.
const hist = { undo: [], redo: [], current: '' };
// "Last updated" is stamped automatically, so it is left out of the undo history.
const stampNow = () =>
  new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const snap = () => {
  const { logo, theme, meta, ...rest } = state;
  const { lastUpdated, ...metaRest } = meta || {};
  return JSON.stringify({ ...rest, meta: metaRest });
};
export function resetHistory() {
  hist.undo = [];
  hist.redo = [];
  hist.current = snap();
}
export const canUndo = () => hist.undo.length > 0;
export const canRedo = () => hist.redo.length > 0;

function restore(json) {
  const keep = { logo: state.logo, theme: state.theme };
  const prev = JSON.parse(json);
  applyState({ ...prev, ...keep, meta: { ...(prev.meta || {}), lastUpdated: state.meta.lastUpdated } });
  state.meta.lastUpdated = stampNow();
  save();
}
export function undo() {
  if (!hist.undo.length) return false;
  hist.redo.push(hist.current);
  hist.current = hist.undo.pop();
  restore(hist.current);
  return true;
}
export function redo() {
  if (!hist.redo.length) return false;
  hist.undo.push(hist.current);
  hist.current = hist.redo.pop();
  restore(hist.current);
  return true;
}

// ---------- Saving ----------
let saveTimer;
function save() {
  recalc();
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* storage full: ignore */ }
  if (ui.apiAvailable && ui.mode === 'admin' && ui.token) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const ok = await api.saveState(state, ui.token);
      if (!ok) toast('Could not save to the server. Check your connection or admin token.');
    }, 400);
  }
}

export function persist() {
  recalc();
  const next = snap();
  if (next !== hist.current) {
    hist.undo.push(hist.current);
    if (hist.undo.length > 100) hist.undo.shift();
    hist.redo = [];
    hist.current = next;
    if (ui.mode === 'admin') state.meta.lastUpdated = stampNow(); // any real change by the admin
  }
  save();
}

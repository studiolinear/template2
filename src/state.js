import { defaultPackages, defaultTemplates, defaultMonths, defaultWaiting, defaultMeta } from './data.js';
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
};

// Persisted project state
export const state = {};

const clone = (o) => JSON.parse(JSON.stringify(o));

export function applyState(incoming) {
  const base = {
    packages: clone(defaultPackages),
    templates: clone(defaultTemplates),
    waiting: clone(defaultWaiting),
    months: clone(defaultMonths),
    currentWeek: 19,
    meta: clone(defaultMeta),
    kpiOrder: [],
  };
  const s = incoming || {};
  Object.assign(state, base, s);
  state.meta = { ...base.meta, ...(s.meta || {}) };
  recalc();
  if (!state.packages.some((p) => p.id === ui.activePackageId)) {
    ui.activePackageId = state.packages[0]?.id ?? null;
  }
}

export const totalWeeks = () => state.months.reduce((acc, m) => acc + m.weeksCount, 0);

// Completion % and status are derived from the scope checklists + current week.
export function recalc() {
  state.packages.forEach((pkg) => {
    const total = pkg.scope.length;
    const done = pkg.scope.filter((s) => s.completed).length;
    pkg.percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    if (total > 0 && done === total) pkg.status = 'completed';
    else if (done > 0) pkg.status = 'in-progress';
    else if (pkg.startWeek <= state.currentWeek && pkg.endWeek >= state.currentWeek) pkg.status = 'in-progress';
    else if (pkg.startWeek > state.currentWeek) pkg.status = 'upcoming';
    else pkg.status = 'in-progress'; // past its end week with nothing done = overdue, not complete
  });
}

let saveTimer;
export function persist() {
  recalc();
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  if (ui.apiAvailable && ui.mode === 'admin' && ui.token) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const ok = await api.saveState(state, ui.token);
      if (!ok) toast('Could not save to the server. Check your connection or admin token.');
    }, 400);
  }
}

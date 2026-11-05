import { state, ui, persist, totalWeeks, TOKEN_KEY } from './state.js';
import * as api from './api.js';
import { toast } from './ui/toast.js';
import { renderAll } from './render.js';
import { openModal, closeModal, safeUrl } from './utils.js';

const getPkg = (id) => state.packages.find((p) => p.id === id);
const activePkg = () => getPkg(ui.activePackageId);
const commit = () => { persist(); renderAll(); };
const scrollTo = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
const uid = (p) => `${p}-${Date.now().toString(36)}`;

function selectPackage(id) {
  ui.activePackageId = id;
  renderAll();
}

async function setMode(mode) {
  if (mode === 'admin' && ui.apiAvailable) {
    const valid = ui.token && (await api.verifyToken(ui.token));
    if (!valid) {
      const t = prompt('Enter the admin token:');
      if (!t) return;
      if (!(await api.verifyToken(t))) return toast('That admin token is not valid.');
      ui.token = t;
      localStorage.setItem(TOKEN_KEY, t);
    }
  }
  ui.mode = mode;
  const url = new URL(location.href);
  url.searchParams.delete('mode');
  if (mode === 'client') url.searchParams.set('view', 'client');
  else url.searchParams.delete('view');
  history.replaceState(null, '', url);
  renderAll();
  toast(mode === 'admin' ? 'Admin mode: editing enabled' : 'Client mode: view only');
}

function copyLink(kind) {
  const base = location.origin + location.pathname;
  const url = kind === 'admin' ? `${base}?mode=admin` : `${base}?view=client`;
  const done = () => toast(kind === 'admin' ? 'Admin link copied' : 'Client link copied');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done);
  else {
    const i = document.createElement('input');
    i.value = url;
    document.body.appendChild(i);
    i.select();
    document.execCommand('copy');
    i.remove();
    done();
  }
}

// ---- Actions available to everyone (view-only safe) ----
const publicActions = {
  'set-mode': ({ mode }) => setMode(mode),
  'copy-link': ({ kind }) => copyLink(kind),
  'open-modal': ({ id }) => openModal(id),
  'close-modal': ({ id }) => closeModal(id),
  filter: ({ filter }) => { ui.ganttFilter = filter; renderAll(); },
  'open-drawer': ({ id }) => { ui.drawerPkgId = id; renderAll(); },
  'close-drawer': () => { ui.drawerPkgId = null; renderAll(); },
  'goto-package': ({ id }) => { selectPackage(id); scrollTo('detailedSection'); },
  'phase-click': ({ id }) => { ui.activePackageId = id; ui.drawerPkgId = id; renderAll(); },
  'open-details': ({ id }) => { ui.drawerPkgId = null; selectPackage(id); scrollTo('detailedSection'); },
  tab: ({ tab }) => { ui.activeTab = tab; renderAll(); },
};

// ---- Actions that change data: ignored unless in admin mode ----
const adminActions = {
  'add-month': () => {
    const name = prompt('Month name (e.g. MARCH):');
    if (!name) return;
    state.months.push({ name: name.toUpperCase(), weeksCount: 4 });
    commit();
  },
  'delete-month': ({ idx }) => {
    if (state.months.length <= 1) return toast('At least one month is required.');
    state.months.splice(+idx, 1);
    state.currentWeek = Math.min(state.currentWeek, totalWeeks());
    commit();
  },
  'add-week': () => { state.months[state.months.length - 1].weeksCount++; commit(); toast('Week column added'); },
  'remove-week': () => {
    if (totalWeeks() <= 1) return;
    const last = state.months[state.months.length - 1];
    if (last.weeksCount > 1) last.weeksCount--;
    else if (state.months.length > 1) state.months.pop();
    state.currentWeek = Math.min(state.currentWeek, totalWeeks());
    commit();
    toast('Week column removed');
  },
  'adjust-weeks': ({ id, ds, de }) => {
    const pkg = getPkg(id);
    const max = totalWeeks();
    pkg.startWeek = Math.max(1, Math.min(max, pkg.startWeek + +ds));
    pkg.endWeek = Math.min(max, Math.max(pkg.startWeek, pkg.endWeek + +de));
    if (pkg.weekly.length === 1) pkg.weekly[0].week = `W${pkg.startWeek}-W${pkg.endWeek}`;
    commit();
  },
  'add-package': () => {
    const name = prompt('New package name:');
    if (!name) return;
    const pkg = {
      id: uid('pkg'), number: String(state.packages.length + 1), name, status: 'upcoming',
      startWeek: Math.min(state.currentWeek + 1, totalWeeks()), endWeek: Math.min(state.currentWeek + 5, totalWeeks()),
      templateId: state.templates[0]?.id, scope: [{ id: uid('s'), title: 'Initial kickoff & alignment', completed: false }],
      weekly: [], assets: [],
    };
    state.packages.push(pkg);
    ui.activePackageId = pkg.id;
    commit();
    toast(`Package “${name}” added`);
  },
  'remove-package': () => {
    const pkg = activePkg();
    if (!pkg || !confirm(`Delete “${pkg.name}”? This cannot be undone.`)) return;
    state.packages = state.packages.filter((p) => p.id !== pkg.id);
    ui.activePackageId = state.packages[0]?.id ?? null;
    commit();
  },
  'add-scope': () => {
    const title = prompt('New deliverable:');
    if (!title) return;
    activePkg().scope.push({ id: uid('s'), title, completed: false });
    commit();
  },
  'remove-scope': ({ item }) => { const p = activePkg(); p.scope = p.scope.filter((s) => s.id !== item); commit(); },
  'add-weekly': () => {
    activePkg().weekly.push({ week: `W${state.currentWeek}`, work: 'New scheduled work', client: 'Client input', milestone: 'Milestone', files: '—', notes: '' });
    commit();
  },
  'remove-weekly': ({ idx }) => { activePkg().weekly.splice(+idx, 1); commit(); },
  'add-asset': () => {
    const name = prompt('File name (e.g. Master_Logo_Deck.pdf):');
    if (!name) return;
    const url = safeUrl(prompt('Share link (Drive/Dropbox URL, optional):') || '');
    activePkg().assets.push({ name, size: '', url });
    commit();
  },
  'link-asset': ({ idx }) => {
    const raw = prompt('Share link (must start with http:// or https://):', activePkg().assets[+idx].url || '');
    if (raw === null) return;
    const url = safeUrl(raw);
    if (raw && !url) return toast('Links must start with http:// or https://');
    activePkg().assets[+idx].url = url;
    commit();
  },
  'delete-asset': ({ idx }) => { activePkg().assets.splice(+idx, 1); commit(); },
  'add-waiting': () => {
    const title = prompt('Item waiting on client:');
    if (!title) return;
    state.waiting.push({ id: uid('w'), title });
    commit();
  },
  'remove-waiting': ({ idx }) => { state.waiting.splice(+idx, 1); commit(); },
  'add-template': () => {
    const title = prompt('Intake form template title:');
    if (!title) return;
    state.templates.push({ id: uid('tmpl'), title, description: 'Custom intake form.', fields: [{ label: 'Deliverable goals', value: '' }] });
    commit();
  },
  'delete-template': ({ idx }) => {
    if (state.templates.length <= 1) return toast('Keep at least one template.');
    const [gone] = state.templates.splice(+idx, 1);
    state.packages.forEach((p) => { if (p.templateId === gone.id) p.templateId = state.templates[0].id; });
    commit();
  },
};

// ---- Change events (checkboxes, selects, textareas) ----
const changeActions = {
  'switch-package': (_, el) => selectPackage(el.value),
  'toggle-item': ({ pkg, item }) => {
    const it = getPkg(pkg)?.scope.find((s) => s.id === item);
    if (!it || ui.mode !== 'admin') return renderAll();
    it.completed = !it.completed;
    commit();
  },
  'set-week': (_, el) => {
    if (ui.mode !== 'admin') return;
    state.currentWeek = Math.max(1, Math.min(totalWeeks(), parseInt(el.value, 10) || 1));
    commit();
  },
  'assign-template': (_, el) => {
    if (ui.mode !== 'admin') return;
    activePkg().templateId = el.value;
    commit();
    toast('Intake template updated');
  },
  'intake-field': ({ idx }, el) => {
    if (ui.mode !== 'admin') return;
    const p = activePkg();
    p.intake = p.intake || {};
    p.intake[idx] = el.value;
    persist();
  },
};

// ---- Inline edits (contenteditable blur) ----
const edits = {
  meta: ({ key }, v) => { state.meta[key] = v; persist(); },
  month: ({ idx }, v) => { if (v) state.months[+idx].name = v.toUpperCase(); persist(); renderAll(); },
  'pkg-title': (_, v) => { const p = activePkg(); const n = v.replace(/^\d+\s*/, '').trim(); if (n) p.name = n; commit(); },
  'scope-title': ({ item }, v) => { const it = activePkg().scope.find((s) => s.id === item); if (v) it.title = v; commit(); },
  weekly: ({ idx, key }, v) => { activePkg().weekly[+idx][key] = v; persist(); },
  'asset-name': ({ idx }, v) => { if (v) activePkg().assets[+idx].name = v; commit(); },
  waiting: ({ idx }, v) => { if (v) state.waiting[+idx].title = v; commit(); },
  'tmpl-title': ({ idx }, v) => { if (v) state.templates[+idx].title = v; commit(); },
  'tmpl-desc': ({ idx }, v) => { state.templates[+idx].description = v; commit(); },
};

const MULTILINE = new Set(['thisWeekItems', 'milestones']);

export function bindEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const name = el.dataset.action;
    if (publicActions[name]) return publicActions[name](el.dataset, el);
    if (adminActions[name] && ui.mode === 'admin') return adminActions[name](el.dataset, el);
  });

  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && changeActions[el.dataset.change]) changeActions[el.dataset.change](el.dataset, el);
  });

  document.addEventListener('focusout', (e) => {
    const el = e.target.closest?.('[data-edit]');
    if (!el || ui.mode !== 'admin' || el.contentEditable !== 'true') return;
    edits[el.dataset.edit]?.(el.dataset, el.innerText.trim());
  });

  document.addEventListener('keydown', (e) => {
    const el = e.target.closest?.('[data-edit]');
    if (el && e.key === 'Enter' && !MULTILINE.has(el.dataset.key)) { e.preventDefault(); el.blur(); }
  });

  // Paste as plain text into editable fields
  document.addEventListener('paste', (e) => {
    if (!e.target.closest?.('[data-edit]')) return;
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  });

  document.getElementById('actionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = { type: f.actionType.value, packageId: f.actionPackage.value, message: f.message.value };
    if (ui.apiAvailable) {
      if (!(await api.submitAction(payload))) return toast('Could not send. Please try again.');
      toast('Sent to the Studio Linear team');
    } else {
      toast('Demo mode: no server connected, so nothing was sent');
    }
    closeModal('actionModal');
    f.reset();
  });
}

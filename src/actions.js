import { state, ui, persist, totalWeeks, TOKEN_KEY, uid, undo, redo, resetHistory } from './state.js';
import * as api from './api.js';
import { toast } from './ui/toast.js';
import { renderAll } from './render.js';
import { openModal, closeModal, safeUrl, $ } from './utils.js';
import { applyTheme } from './theme.js';
import { store, submitResponse, clearResponse } from './responses.js';
import { exportPdf } from './pdf.js';
import { renderInbox } from './ui/inbox.js';
import { HAS_OPTIONS } from './ui/forms.js';

const clone = (o) => JSON.parse(JSON.stringify(o));
const getPkg = (id) => state.packages.find((p) => p.id === id);
const activePkg = () => getPkg(ui.activePackageId);
const getTmpl = (id) => state.templates.find((t) => t.id === id);
const builderTmpl = () => getTmpl(ui.builderTemplateId);
const commit = () => { persist(); renderAll(); };
const scrollTo = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
const clampW = (n) => Math.max(1, Math.min(totalWeeks(), n));

function move(list, from, to) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return false;
  list.splice(to, 0, list.splice(from, 1)[0]);
  return true;
}
const moveBy = (list, i, dir) => move(list, i, i + Number(dir));

function setWeeks(pkg, start, end, anchor) {
  start = clampW(start);
  end = clampW(end);
  if (start > end) { if (anchor === 'start') end = start; else start = end; }
  pkg.startWeek = start;
  pkg.endWeek = end;
  if (pkg.weekly.length === 1) pkg.weekly[0].week = `W${start}-W${end}`;
}

function selectPackage(id) { ui.activePackageId = id; renderAll(); }

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
  resetHistory();
  const url = new URL(location.href);
  url.searchParams.delete('mode');
  if (mode === 'client') url.searchParams.set('view', 'client'); else url.searchParams.delete('view');
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
    i.value = url; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); done();
  }
}

function doUndo() { if (undo()) { renderAll(); toast('Undone'); } else toast('Nothing to undo'); }
function doRedo() { if (redo()) { renderAll(); toast('Redone'); } else toast('Nothing to redo'); }

// Logo: shrink to a small PNG (or keep SVG) and store it in the project data.
async function readLogo(file) {
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) return toast('Please choose an image under 3 MB.');
  const toDataUrl = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
  try {
    let data;
    if (file.type === 'image/svg+xml') {
      if (file.size > 300 * 1024) return toast('SVG is too large (max 300 KB). Try a PNG.');
      data = await toDataUrl(file);
    } else {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 160 / bmp.height, 600 / bmp.width);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * scale));
      c.height = Math.max(1, Math.round(bmp.height * scale));
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      data = c.toDataURL('image/png');
      if (data.length > 450000) data = c.toDataURL('image/jpeg', 0.85);
    }
    state.logo = data;
    commit();
    toast('Logo updated');
  } catch {
    toast('Could not read that image.');
  }
}

// ---- Actions available to everyone ----
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
  'close-builder': () => { ui.builderTemplateId = null; renderAll(); },
  tab: ({ tab }) => { ui.activeTab = tab; renderAll(); },
  'export-pdf': ({ id }) => exportPdf([id]),
  'submit-intake': async ({ id }) => {
    const pkg = getPkg(id);
    const tmpl = getTmpl(pkg?.templateId) || state.templates[0];
    if (!tmpl) return;
    const resp = store[id];
    const d = ui.drafts[id] || {};
    const name = (d.name ?? resp?.name ?? '').trim();
    const email = (d.email ?? resp?.email ?? '').trim();
    const merged = { ...(resp?.answers || {}), ...(d.answers || {}) };
    const answers = {};
    const missing = [];
    if (!name) missing.push('Your name');
    tmpl.sections.forEach((s) => s.questions.forEach((q) => {
      const v = merged[q.id];
      if (v !== undefined) answers[q.id] = v;
      if (q.required && !(Array.isArray(v) ? v.length : String(v ?? '').trim())) missing.push(q.label || 'Untitled question');
    }));
    if (missing.length) return toast(`Please complete: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''}`);
    const snapshot = { title: tmpl.title, description: tmpl.description, sections: clone(tmpl.sections) };
    const ok = await submitResponse(id, { answers, name, email, templateId: tmpl.id, snapshot });
    if (!ok) return toast('Could not submit. Please try again.');
    delete ui.drafts[id];
    renderAll();
    toast(ui.apiAvailable ? 'Submitted. Thank you!' : 'Demo mode: saved in this browser only');
  },
};

// ---- Actions that change data: ignored unless in admin mode ----
const adminActions = {
  undo: doUndo,
  redo: doRedo,
  'open-settings': () => openModal('settingsModal'),
  'open-inbox': async () => {
    openModal('inboxModal');
    $('#inboxBody').innerHTML = '<p class="text-xs text-slate-400">Loading…</p>';
    renderInbox(ui.apiAvailable ? await api.fetchInbox(ui.token) : { inquiries: [], submissions: [], emailConfigured: true });
  },
  'set-color': ({ color }) => { state.theme.color = color; commit(); },
  'reset-theme': () => { state.theme.color = '#e53935'; commit(); },
  'remove-logo': () => { state.logo = ''; commit(); toast('Logo removed'); },

  'add-month': () => {
    const name = prompt('Month name (e.g. MARCH):');
    if (!name) return;
    state.months.push({ name: name.toUpperCase(), weeksCount: 4 });
    commit();
  },
  'delete-month': ({ idx }) => {
    if (state.months.length <= 1) return toast('At least one month is required.');
    state.months.splice(+idx, 1);
    state.currentWeek = clampW(state.currentWeek);
    state.packages.forEach((p) => setWeeks(p, p.startWeek, p.endWeek, 'start'));
    commit();
  },
  'add-week': () => { state.months[state.months.length - 1].weeksCount++; commit(); toast('Week column added'); },
  'remove-week': () => {
    if (totalWeeks() <= 1) return;
    const last = state.months[state.months.length - 1];
    if (last.weeksCount > 1) last.weeksCount--; else if (state.months.length > 1) state.months.pop();
    state.currentWeek = clampW(state.currentWeek);
    state.packages.forEach((p) => setWeeks(p, p.startWeek, p.endWeek, 'start'));
    commit();
    toast('Week column removed');
  },
  // Move the start and/or end week by +/-1 (start and end are independent)
  'adjust-weeks': ({ id, ds, de }) => {
    const p = getPkg(id);
    setWeeks(p, p.startWeek + +ds, p.endWeek + +de, +ds ? 'start' : 'end');
    commit();
  },
  'move-package': ({ id, dir }) => {
    if (ui.ganttFilter !== 'all') return toast('Set the filter to "All" to reorder packages.');
    if (moveBy(state.packages, state.packages.findIndex((p) => p.id === id), dir)) commit();
  },
  'move-scope': ({ item, dir }) => {
    const p = activePkg();
    if (moveBy(p.scope, p.scope.findIndex((s) => s.id === item), dir)) commit();
  },
  'add-package': () => {
    const name = prompt('New package name:');
    if (!name) return;
    const pkg = {
      id: uid('pkg'), number: '', name, status: 'upcoming',
      startWeek: clampW(state.currentWeek + 1), endWeek: clampW(state.currentWeek + 5),
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
    if (!pkg || !confirm(`Delete “${pkg.name}”? You can undo this with the Undo button.`)) return;
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

  // Intake form templates + builder
  'add-template': () => {
    const t = {
      id: uid('tmpl'), title: 'New intake form', description: '',
      sections: [{ id: uid('sec'), title: 'Section 1', description: '', questions: [{ id: uid('q'), type: 'text', label: 'Your first question', required: false, options: [] }] }],
    };
    state.templates.push(t);
    ui.builderTemplateId = t.id;
    commit();
  },
  'dup-template': ({ idx }) => {
    const copy = clone(state.templates[+idx]);
    copy.id = uid('tmpl');
    copy.title += ' (copy)';
    copy.sections.forEach((s) => { s.id = uid('sec'); s.questions.forEach((q) => { q.id = uid('q'); }); });
    state.templates.splice(+idx + 1, 0, copy);
    commit();
  },
  'delete-template': ({ idx }) => {
    if (state.templates.length <= 1) return toast('Keep at least one template.');
    if (!confirm('Delete this form template? You can undo this with the Undo button.')) return;
    const [gone] = state.templates.splice(+idx, 1);
    state.packages.forEach((p) => { if (p.templateId === gone.id) p.templateId = state.templates[0].id; });
    commit();
  },
  'open-builder': ({ id }) => { ui.builderTemplateId = id; renderAll(); },
  'edit-assigned-form': () => { ui.builderTemplateId = activePkg().templateId; renderAll(); },
  'bld-add-sec': () => {
    builderTmpl().sections.push({ id: uid('sec'), title: 'New section', description: '', questions: [] });
    commit();
  },
  'bld-del-sec': ({ si }) => { builderTmpl().sections.splice(+si, 1); commit(); },
  'bld-move-sec': ({ si, dir }) => { if (moveBy(builderTmpl().sections, +si, dir)) commit(); },
  'bld-add-q': ({ si }) => {
    builderTmpl().sections[+si].questions.push({ id: uid('q'), type: 'text', label: 'New question', required: false, options: [] });
    commit();
  },
  'bld-del-q': ({ si, qi }) => { builderTmpl().sections[+si].questions.splice(+qi, 1); commit(); },
  'bld-move-q': ({ si, qi, dir }) => { if (moveBy(builderTmpl().sections[+si].questions, +qi, dir)) commit(); },
  'clear-response': async ({ id }) => {
    if (!confirm('Clear this submitted form? The client will be able to fill it in again.')) return;
    if (!(await clearResponse(id))) return toast('Could not clear the submission.');
    renderAll();
  },
  'export-all-pdf': () => exportPdf(state.packages.map((p) => p.id)),
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
    state.currentWeek = clampW(parseInt(el.value, 10) || 1);
    commit();
  },
  'set-start': (_, el) => { if (ui.mode !== 'admin') return; const p = activePkg(); setWeeks(p, parseInt(el.value, 10) || p.startWeek, p.endWeek, 'start'); commit(); },
  'set-end': (_, el) => { if (ui.mode !== 'admin') return; const p = activePkg(); setWeeks(p, p.startWeek, parseInt(el.value, 10) || p.endWeek, 'end'); commit(); },
  'assign-template': (_, el) => {
    if (ui.mode !== 'admin') return;
    activePkg().templateId = el.value;
    commit();
    toast('Intake form updated for this package');
  },
  'theme-color': (_, el) => { if (ui.mode !== 'admin') return; state.theme.color = el.value; commit(); },
  'logo-file': (_, el) => { if (ui.mode !== 'admin') return; readLogo(el.files[0]); el.value = ''; },
  // Form builder fields
  'bld-tmpl': ({ key }, el) => { builderTmpl()[key] = el.value; persist(); },
  'bld-sec': ({ si, key }, el) => { builderTmpl().sections[+si][key] = el.value; persist(); },
  'bld-q': ({ si, qi, key }, el) => {
    const q = builderTmpl().sections[+si].questions[+qi];
    if (key === 'required') q.required = el.checked;
    else if (key === 'options') q.options = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    else if (key === 'type') {
      q.type = el.value;
      if (HAS_OPTIONS.has(q.type) && !q.options.length) q.options = ['Option 1', 'Option 2'];
      return commit();
    } else q[key] = el.value;
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
};

const MULTILINE = new Set(['thisWeekItems', 'milestones']);

// Remember what a client has typed into the intake form (kept even if the page re-renders)
function recordDraft(el) {
  const pkg = el.dataset.pkg;
  if (!pkg) return;
  const d = (ui.drafts[pkg] ||= { answers: {} });
  if (el.dataset.draft) { d[el.dataset.draft] = el.value; return; }
  if (!el.dataset.ans) return;
  const qid = el.dataset.q;
  if (el.dataset.type === 'checkbox') {
    d.answers[qid] = [...document.querySelectorAll('#intakeFormContainer input[type=checkbox][data-ans]')]
      .filter((i) => i.dataset.q === qid && i.checked).map((i) => i.value);
  } else d.answers[qid] = el.value;
}

export function bindEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const name = el.dataset.action;
    if (publicActions[name]) return publicActions[name](el.dataset, el);
    if (adminActions[name] && ui.mode === 'admin') return adminActions[name](el.dataset, el);
  });

  document.addEventListener('change', (e) => {
    recordDraft(e.target);
    const el = e.target.closest('[data-change]');
    if (el && changeActions[el.dataset.change]) changeActions[el.dataset.change](el.dataset, el);
  });

  document.addEventListener('input', (e) => {
    recordDraft(e.target);
    if (e.target.id === 'themeColor' && ui.mode === 'admin') applyTheme(e.target.value); // live preview
  });

  document.addEventListener('focusout', (e) => {
    const el = e.target.closest?.('[data-edit]');
    if (!el || ui.mode !== 'admin' || el.contentEditable !== 'true') return;
    edits[el.dataset.edit]?.(el.dataset, el.innerText.trim());
  });

  document.addEventListener('keydown', (e) => {
    const el = e.target.closest?.('[data-edit]');
    if (el && e.key === 'Enter' && !MULTILINE.has(el.dataset.key)) { e.preventDefault(); el.blur(); return; }
    // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo (not while typing in a field)
    if ((e.ctrlKey || e.metaKey) && ui.mode === 'admin' && !e.target.closest?.('input,textarea,select,[contenteditable="true"]')) {
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); doRedo(); }
    }
  });

  // Paste as plain text into editable fields
  document.addEventListener('paste', (e) => {
    if (!e.target.closest?.('[data-edit]')) return;
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  });

  // Drag-and-drop results from sortables.js
  document.addEventListener('reorder', (e) => {
    if (ui.mode !== 'admin') return;
    const { kind, from, to, order } = e.detail;
    if (kind === 'kpi') { state.kpiOrder = order; return persist(); }
    const list = kind === 'pkg' ? state.packages : activePkg().scope;
    if (move(list, from, to)) commit(); else renderAll();
  });

  $('#actionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = { type: f.actionType.value, packageId: f.actionPackage.value, message: f.message.value };
    if (ui.apiAvailable) {
      if (!(await api.submitAction(payload))) return toast('Could not send. Please try again.');
      toast('Sent to the Studio Linear team');
    } else toast('Demo mode: no server connected, so nothing was sent');
    closeModal('actionModal');
    f.reset();
  });

  $('#inquiryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    const payload = { name: f.name.value.trim(), email: f.email.value.trim(), message: f.message.value.trim(), website: f.website.value };
    if (!ui.apiAvailable) return toast('Demo mode: no server connected, so nothing was sent');
    btn.disabled = true;
    const r = await api.sendInquiry(payload);
    btn.disabled = false;
    if (!r) return toast('Could not send your message. Please check the fields and try again.');
    f.reset();
    toast('Thanks! Your message was sent to Studio Linear.');
  });
}

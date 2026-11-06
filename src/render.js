import { state, ui, canUndo, canRedo } from './state.js';
import { $, $$, refreshIcons } from './utils.js';
import { applyTheme, THEME_PRESETS } from './theme.js';
import { initSortables } from './sortables.js';
import { renderMeta, renderOverall, renderPhases, renderGlance, renderWaiting } from './ui/kpis.js';
import { renderInProgress } from './ui/inProgress.js';
import { renderGantt } from './ui/gantt.js';
import { renderDetail } from './ui/detail.js';
import { renderDrawer } from './ui/drawer.js';
import { renderTemplatesModal } from './ui/templates.js';
import { renderBuilder } from './ui/builder.js';

function applyMode() {
  const admin = ui.mode === 'admin';
  document.body.classList.toggle('admin-mode', admin);
  document.body.classList.toggle('client-mode', !admin);

  const badge = $('#viewModeBadge');
  badge.textContent = admin ? 'ADMIN EDIT MODE' : 'CLIENT VIEW MODE';
  badge.className = `text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm ${admin ? 'bg-white text-brand' : 'bg-amber-400 text-slate-900'}`;

  const on = 'px-2.5 py-1 rounded-md font-bold bg-white text-brand shadow transition';
  const off = 'px-2.5 py-1 rounded-md font-bold text-white hover:bg-brand-600 transition';
  $('#btnAdminMode').className = admin ? on : off;
  $('#btnClientMode').className = admin ? off : on;

  $$('[data-edit]').forEach((el) => (el.contentEditable = admin ? 'true' : 'false'));
}

// Theme colour, logo, undo/redo availability, settings dialog
function applyChrome() {
  const color = state.theme?.color || '#e53935';
  applyTheme(color);

  const has = !!state.logo;
  const logo = $('#brandLogo');
  if (has) logo.src = state.logo; else logo.removeAttribute('src');
  logo.classList.toggle('hidden', !has);
  const prev = $('#logoPreview');
  if (has) prev.src = state.logo; else prev.removeAttribute('src');
  prev.classList.toggle('hidden', !has);
  $('#logoEmpty').classList.toggle('hidden', has);

  $('#btnUndo').disabled = !canUndo();
  $('#btnRedo').disabled = !canRedo();

  const picker = $('#themeColor');
  if (document.activeElement !== picker) picker.value = color;
  $('#themeSwatches').innerHTML = THEME_PRESETS.map(
    ([hex, name]) =>
      `<button data-action="set-color" data-color="${hex}" title="${name}" aria-label="${name}" class="w-7 h-7 rounded-full border-2 ${hex.toLowerCase() === color.toLowerCase() ? 'border-slate-900' : 'border-white shadow'}" style="background:${hex}"></button>`
  ).join('');
}

export function renderAll() {
  renderMeta();
  renderOverall();
  renderPhases();
  renderGlance();
  renderWaiting();
  renderInProgress();
  renderGantt();
  renderDetail();
  renderDrawer();
  renderTemplatesModal();
  renderBuilder();
  const c = $('#kpiCardsContainer');
  (state.kpiOrder || []).forEach((id) => {
    const el = c.querySelector(`[data-card-id="${id}"]`);
    if (el) c.appendChild(el);
  });
  applyMode(); // after renders so new [data-edit] nodes become editable
  applyChrome();
  initSortables();
  refreshIcons();
}

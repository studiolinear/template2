import Sortable from 'sortablejs';
import { state, ui } from './state.js';
import { $, $$, refreshIcons } from './utils.js';
import { renderMeta, renderOverall, renderPhases, renderGlance, renderWaiting } from './ui/kpis.js';
import { renderInProgress } from './ui/inProgress.js';
import { renderGantt } from './ui/gantt.js';
import { renderDetail } from './ui/detail.js';
import { renderDrawer } from './ui/drawer.js';
import { renderTemplatesModal } from './ui/templates.js';

function applyMode() {
  const admin = ui.mode === 'admin';
  document.body.classList.toggle('admin-mode', admin);
  document.body.classList.toggle('client-mode', !admin);

  const badge = $('#viewModeBadge');
  badge.textContent = admin ? 'ADMIN EDIT MODE' : 'CLIENT VIEW MODE';
  badge.className = `text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm ${admin ? 'bg-white text-brand' : 'bg-amber-400 text-slate-900'}`;

  const on = 'px-2.5 py-1 rounded-md font-bold bg-white text-brand shadow transition';
  const off = 'px-2.5 py-1 rounded-md font-bold text-white hover:bg-red-600 transition';
  $('#btnAdminMode').className = admin ? on : off;
  $('#btnClientMode').className = admin ? off : on;

  $$('[data-edit]').forEach((el) => (el.contentEditable = admin ? 'true' : 'false'));
  const sortable = Sortable.get($('#kpiCardsContainer'));
  if (sortable) sortable.option('disabled', !admin);
}

function applyKpiOrder() {
  const c = $('#kpiCardsContainer');
  (state.kpiOrder || []).forEach((id) => {
    const el = c.querySelector(`[data-card-id="${id}"]`);
    if (el) c.appendChild(el);
  });
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
  applyKpiOrder();
  applyMode(); // after renders so new [data-edit] nodes become editable
  refreshIcons();
}

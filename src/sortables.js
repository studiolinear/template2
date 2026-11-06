// Drag-and-drop. Sortable only moves DOM nodes; we report the move and the app updates its data.
import Sortable from 'sortablejs';
import { ui } from './state.js';
import { $ } from './utils.js';

const emit = (detail) => document.dispatchEvent(new CustomEvent('reorder', { detail }));

function ensure(el, opts) {
  if (!el) return;
  const s = Sortable.get(el) || Sortable.create(el, opts);
  s.option('disabled', ui.mode !== 'admin');
}

export function initSortables() {
  const kpi = $('#kpiCardsContainer');
  ensure(kpi, {
    handle: '.drag-handle', animation: 150, ghostClass: 'sortable-ghost',
    onEnd: () => emit({ kind: 'kpi', order: [...kpi.children].map((c) => c.dataset.cardId) }),
  });
  ensure($('#checklistItemsContainer'), {
    handle: '.item-handle', animation: 150, ghostClass: 'sortable-ghost',
    onEnd: (e) => emit({ kind: 'scope', from: e.oldIndex, to: e.newIndex }),
  });
  // The timeline rows element is re-created on every render, so create a fresh instance each time.
  const rows = $('#ganttRows');
  if (rows && ui.mode === 'admin' && ui.ganttFilter === 'all') {
    Sortable.create(rows, {
      handle: '.row-handle', animation: 150, ghostClass: 'sortable-ghost',
      onEnd: (e) => emit({ kind: 'pkg', from: e.oldIndex, to: e.newIndex }),
    });
  }
}

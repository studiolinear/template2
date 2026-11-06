import { state, ui, totalWeeks } from '../state.js';
import { $, $$, esc, STATUS } from '../utils.js';

const LEFT = 240; // px width of the package-name column

const mini = (action, attrs, label, title) =>
  `<button data-action="${action}" ${attrs} title="${title}" class="w-4 h-4 leading-none rounded bg-slate-100 hover:bg-brand hover:text-white text-slate-500 font-bold">${label}</button>`;

export function renderGantt() {
  const total = totalWeeks();
  const cur = state.currentWeek;
  const cols = `${LEFT}px repeat(${total}, minmax(0, 1fr))`;
  const canReorder = ui.ganttFilter === 'all';
  const pkgs = state.packages.filter((p) => ui.ganttFilter === 'all' || p.status === ui.ganttFilter);

  $$('[data-filter]').forEach((b) => b.classList.toggle('ring-2', b.dataset.filter === ui.ganttFilter));

  const monthCols = state.months
    .map(
      (m, i) => `
      <div class="p-2 border-r border-brand-600 flex justify-between items-center" style="grid-column: span ${m.weeksCount}">
        <span data-edit="month" data-idx="${i}">${esc(m.name)}</span>
        <button data-action="delete-month" data-idx="${i}" class="text-brand-200 hover:text-white admin-only text-[10px]" title="Remove month">✕</button>
      </div>`
    )
    .join('');

  let weekCols = '';
  let gridCells = '';
  for (let w = 1; w <= total; w++) {
    weekCols += `<div class="p-1 border-r border-slate-200 ${w === cur ? 'bg-brand-200 font-bold text-brand-700' : ''}">W${w}</div>`;
    gridCells += `<div class="border-r border-slate-100 h-full ${w === cur ? 'bg-brand-50' : ''}"></div>`;
  }

  const rows = pkgs.length
    ? pkgs
        .map((pkg) => {
          const st = STATUS[pkg.status] || STATUS.upcoming;
          const start = Math.min(total, Math.max(1, pkg.startWeek));
          const end = Math.min(total, Math.max(start, pkg.endWeek));
          const left = ((start - 1) / total) * 100;
          const width = ((end - start + 1) / total) * 100;
          const linePos = ((cur - 1) / total) * 100;
          const id = `data-id="${esc(pkg.id)}"`;
          return `
          <div class="grid items-center h-14 border-b border-slate-100 hover:bg-slate-50" style="grid-template-columns: ${LEFT}px minmax(0,1fr)">
            <div class="px-2 flex items-center gap-1.5 min-w-0">
              ${canReorder ? `<span class="row-handle admin-only cursor-grab text-slate-300 hover:text-slate-600 flex-shrink-0" title="Drag to reorder"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>` : ''}
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1">
                  <button data-action="goto-package" ${id} class="truncate text-left font-bold text-slate-800 hover:text-brand flex-1">${esc(pkg.name)}</button>
                  ${canReorder ? `<span class="admin-only flex gap-0.5">${mini('move-package', `${id} data-dir="-1"`, '▲', 'Move up')}${mini('move-package', `${id} data-dir="1"`, '▼', 'Move down')}</span>` : ''}
                </div>
                <div class="admin-only flex items-center gap-0.5 text-[10px] text-slate-500 mt-0.5">
                  <span class="mr-0.5">Start</span>
                  ${mini('adjust-weeks', `${id} data-ds="-1" data-de="0"`, '‹', 'Start 1 week earlier')}${mini('adjust-weeks', `${id} data-ds="1" data-de="0"`, '›', 'Start 1 week later')}
                  <span class="px-1 font-semibold text-slate-700">W${pkg.startWeek}–${pkg.endWeek}</span>
                  <span class="mr-0.5">End</span>
                  ${mini('adjust-weeks', `${id} data-ds="0" data-de="-1"`, '‹', 'End 1 week earlier')}${mini('adjust-weeks', `${id} data-ds="0" data-de="1"`, '›', 'End 1 week later')}
                </div>
              </div>
            </div>
            <div class="relative h-full">
              <div class="absolute inset-0 grid" style="grid-template-columns: repeat(${total}, minmax(0,1fr))">${gridCells}</div>
              <button data-action="open-drawer" ${id}
                title="Open ${esc(pkg.name)} scope checklist (${pkg.percentage}% complete)"
                style="left:${left}%; width:${width}%; top:50%; transform:translateY(-50%)"
                class="absolute h-6 rounded-md ${st.bar} text-white text-[10px] font-bold flex items-center px-2.5 shadow-sm z-10 truncate">
                <span class="truncate">${esc(pkg.name)}</span>
                <span class="ml-auto opacity-90 text-[9px] pl-1 font-extrabold whitespace-nowrap">${pkg.percentage}% (W${pkg.startWeek}-W${pkg.endWeek})</span>
              </button>
              <div style="left:${linePos}%" class="absolute top-0 bottom-0 w-0.5 border-l border-dashed border-brand z-20 pointer-events-none"></div>
            </div>
          </div>`;
        })
        .join('')
    : `<div class="p-8 text-center text-sm text-slate-400">No packages match this filter.</div>`;

  $('#ganttContainer').style.minWidth = `${Math.max(1000, total * 30 + LEFT)}px`;
  $('#ganttContainer').innerHTML = `
    <div class="grid bg-brand text-white text-[11px] font-bold text-center border-b border-brand-700" style="grid-template-columns:${cols}">
      <div class="p-2 border-r border-brand-600 text-left pl-3 uppercase">PACKAGES</div>${monthCols}
    </div>
    <div class="grid bg-slate-100 text-[10px] font-semibold text-slate-600 text-center border-b border-slate-200" style="grid-template-columns:${cols}">
      <div class="p-1 border-r border-slate-200 text-left pl-3 text-slate-400">Week #</div>${weekCols}
    </div>
    <div id="ganttRows" class="text-xs">${rows}</div>`;
}

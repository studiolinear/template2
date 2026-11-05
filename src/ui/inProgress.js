import { state, ui } from '../state.js';
import { $, esc, pad } from '../utils.js';

// NEW: one card per in-progress package showing its scope-of-work checklist.
export function renderInProgress() {
  const admin = ui.mode === 'admin';
  const list = state.packages.filter((p) => p.status === 'in-progress');
  $('#inProgressCount').textContent = list.length;
  const host = $('#inProgressGrid');

  if (!list.length) {
    host.innerHTML = `<div class="col-span-full text-center text-sm text-slate-400 py-8">No packages are in progress right now.</div>`;
    return;
  }

  host.innerHTML = list
    .map((pkg) => {
      const done = pkg.scope.filter((s) => s.completed).length;
      const nextId = pkg.scope.find((s) => !s.completed)?.id;
      const items = pkg.scope
        .map(
          (item) => `
          <li class="flex items-start gap-2.5 py-1.5">
            <input type="checkbox" data-change="toggle-item" data-pkg="${esc(pkg.id)}" data-item="${esc(item.id)}"
              ${item.completed ? 'checked' : ''} ${admin ? '' : 'disabled'}
              class="mt-0.5 w-4 h-4 accent-brand ${admin ? 'cursor-pointer' : 'cursor-default'}" aria-label="${esc(item.title)}" />
            <span class="flex-1 text-xs font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}">${esc(item.title)}</span>
            ${item.id === nextId ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 whitespace-nowrap">Next up</span>` : ''}
          </li>`
        )
        .join('');

      return `
        <article class="border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <button data-action="goto-package" data-id="${esc(pkg.id)}" class="text-left font-extrabold text-sm text-slate-900 hover:text-brand truncate max-w-full">
                  ${pad(pkg.number)} ${esc(pkg.name)}
                </button>
                <p class="text-[11px] text-slate-500 mt-0.5">Weeks ${pkg.startWeek}–${pkg.endWeek}</p>
              </div>
              <span class="text-xl font-black text-brand">${pkg.percentage}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div class="bg-blue-600 h-full rounded-full transition-all duration-500" style="width:${pkg.percentage}%"></div>
            </div>
          </div>
          <ul class="px-4 py-2 divide-y divide-slate-100 flex-1">${items || '<li class="py-3 text-xs text-slate-400">No scope items yet.</li>'}</ul>
          <div class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span class="text-slate-500 font-medium">${done} of ${pkg.scope.length} deliverables complete</span>
            <button data-action="goto-package" data-id="${esc(pkg.id)}" class="font-bold text-brand hover:underline">Open details</button>
          </div>
        </article>`;
    })
    .join('');
}

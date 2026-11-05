import { state, ui } from '../state.js';
import { $, esc, pad, STATUS } from '../utils.js';

export function renderDrawer() {
  const pkg = state.packages.find((p) => p.id === ui.drawerPkgId);
  const open = !!pkg;
  $('#scopeDrawer').classList.toggle('translate-x-full', !open);
  $('#drawerOverlay').classList.toggle('hidden', !open);
  if (!pkg) return;

  const admin = ui.mode === 'admin';
  const st = STATUS[pkg.status] || STATUS.upcoming;
  $('#drawerTitle').textContent = `${pad(pkg.number)} ${pkg.name}`;
  $('#drawerProgressText').textContent = `${pkg.percentage}%`;
  const badge = $('#drawerStatusBadge');
  badge.textContent = st.label;
  badge.className = `font-bold ml-1 px-2 py-0.5 rounded text-[11px] ${st.badge}`;
  $('#drawerOpenDetails').dataset.id = pkg.id;

  $('#drawerChecklistContainer').innerHTML = `
    <div class="mb-2">
      <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Deliverables & scope checklist</h4>
      <p class="text-[11px] text-slate-500">${admin ? 'Check off items as Studio Linear completes them.' : 'Progress is updated by Studio Linear.'}</p>
    </div>
    <div class="space-y-2">
      ${pkg.scope
        .map(
          (item) => `
        <label class="flex items-start gap-3 p-3 border ${item.completed ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'} rounded-lg ${admin ? 'cursor-pointer hover:border-brand' : ''} transition">
          <input type="checkbox" data-change="toggle-item" data-pkg="${esc(pkg.id)}" data-item="${esc(item.id)}" ${item.completed ? 'checked' : ''} ${admin ? '' : 'disabled'} class="w-4 h-4 accent-brand mt-0.5" />
          <div class="flex-1">
            <span class="text-xs font-semibold block ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}">${esc(item.title)}</span>
            <span class="text-[10px] text-slate-400">${item.completed ? 'Completed' : 'Pending'}</span>
          </div>
        </label>`
        )
        .join('')}
    </div>`;
}

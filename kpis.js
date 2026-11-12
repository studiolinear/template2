import { state, ui } from '../state.js';
import { $, esc, pad, STATUS } from '../utils.js';

export function renderMeta() {
  document.querySelectorAll('[data-edit="meta"]').forEach((el) => {
    if (document.activeElement === el) return;
    el.textContent = state.meta[el.dataset.key] ?? '';
  });
  document.querySelectorAll('[data-meta]').forEach((el) => { el.textContent = state.meta[el.dataset.meta] ?? ''; });
  const w = $('#currentWeekInput');
  if (w && document.activeElement !== w) w.value = state.currentWeek;
  if (w) w.disabled = ui.mode !== 'admin';
}

export function renderOverall() {
  let total = 0;
  let done = 0;
  state.packages.forEach((p) => {
    total += p.scope.length;
    done += p.scope.filter((s) => s.completed).length;
  });
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('#overallPercentageText').textContent = `${pct}%`;
  $('#overallProgressBar').style.width = `${pct}%`;
}

export function renderPhases() {
  $('#phasesMiniList').innerHTML = state.packages
    .map((p) => {
      const st = STATUS[p.status] || STATUS.upcoming;
      const icon = p.status === 'completed' ? 'check-circle-2' : 'circle';
      return `
        <li data-action="phase-click" data-id="${esc(p.id)}" class="flex items-center justify-between p-1 hover:bg-slate-50 rounded cursor-pointer transition">
          <div class="flex items-center gap-2 truncate">
            <i data-lucide="${icon}" class="w-3.5 h-3.5 ${st.icon} flex-shrink-0"></i>
            <span class="truncate font-semibold text-slate-700">${esc(p.number)}. ${esc(p.name)}</span>
          </div>
          <span class="text-[10px] font-bold text-slate-400 flex-shrink-0 ml-1">${p.percentage}%</span>
        </li>`;
    })
    .join('');
}

export function renderGlance() {
  const count = (s) => state.packages.filter((p) => p.status === s).length;
  const row = (n, label, cls) => `
    <div class="flex items-center justify-between text-xs">
      <span class="flex items-center gap-2 font-medium text-slate-600">
        <span class="w-5 h-5 rounded ${cls} flex items-center justify-center font-extrabold text-[10px]">${n}</span> ${label}
      </span>
    </div>`;
  $('#atAGlanceCounts').innerHTML =
    row(count('completed'), 'COMPLETED', 'bg-emerald-100 text-emerald-800') +
    row(count('in-progress'), 'IN PROGRESS', 'bg-blue-100 text-blue-800') +
    row(count('waiting'), 'WAITING ON CLIENT', 'bg-amber-100 text-amber-800') +
    row(count('upcoming'), 'UPCOMING', 'bg-slate-100 text-slate-700');
}

export function renderWaiting() {
  const list = $('#waitingOnClientList');
  if (!state.waiting.length) {
    list.innerHTML = `<li class="text-slate-400 font-medium">Nothing pending.</li>`;
    return;
  }
  list.innerHTML = state.waiting
    .map(
      (item, idx) => `
      <li class="flex items-center justify-between gap-2 text-amber-800 font-medium">
        <span><span>• </span><span data-edit="waiting" data-idx="${idx}">${esc(item.title)}</span></span>
        <button data-action="remove-waiting" data-idx="${idx}" class="text-amber-400 hover:text-red-500 admin-only text-[10px]" title="Remove">✕</button>
      </li>`
    )
    .join('');
}

export { pad };

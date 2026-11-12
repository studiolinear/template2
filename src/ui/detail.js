import { state, ui } from '../state.js';
import { $, esc, pad, STATUS, safeUrl, parseWeekRange } from '../utils.js';
import { renderIntake } from './forms.js';

const ibtn = (action, attrs, icon, title) =>
  `<button data-action="${action}" ${attrs} title="${title}" class="p-1 text-slate-400 hover:text-brand rounded"><i data-lucide="${icon}" class="w-3.5 h-3.5"></i></button>`;

export function renderDetail() {
  const sec = $('#detailedSection');
  const pkg = state.packages.find((p) => p.id === ui.activePackageId) || state.packages[0];
  if (!pkg) { sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  ui.activePackageId = pkg.id;
  const admin = ui.mode === 'admin';
  const st = STATUS[pkg.status] || STATUS.upcoming;

  const title = $('#selectedPackageTitle');
  if (document.activeElement !== title) title.textContent = `${pad(pkg.number)} ${pkg.name}`;
  const badge = $('#selectedPackageBadge');
  badge.textContent = st.label.toUpperCase();
  badge.className = `text-xs px-2.5 py-0.5 rounded-full font-bold ${st.badge}`;
  $('#packageSelect').innerHTML = state.packages
    .map((p) => `<option value="${esc(p.id)}" ${p.id === pkg.id ? 'selected' : ''}>${pad(p.number)} ${esc(p.name)}</option>`)
    .join('');
  $('#actionPackage').innerHTML = state.packages.map((p) => `<option value="${esc(p.id)}">${pad(p.number)} ${esc(p.name)}</option>`).join('');
  $('#pkgChecklistPercent').textContent = `${pkg.percentage}%`;
  const w = $('#pkgWaiting');
  w.checked = !!pkg.waiting;
  w.disabled = pkg.status === 'completed'; // a finished package can't be waiting
  [['#pkgStartWeek', pkg.startWeek], ['#pkgEndWeek', pkg.endWeek]].forEach(([sel, v]) => {
    const el = $(sel);
    if (document.activeElement !== el) el.value = v;
  });

  ['scope', 'overview', 'assets', 'intake'].forEach((t) => {
    const on = t === ui.activeTab;
    const btn = $(`#tab-${t}`);
    btn.classList.toggle('border-brand', on);
    btn.classList.toggle('text-brand', on);
    btn.classList.toggle('border-transparent', !on);
    btn.classList.toggle('text-slate-500', !on);
    $(`#content-${t}`).classList.toggle('hidden', !on);
  });

  // 1. Scope checklist (drag handle or ▲▼ to reorder)
  $('#checklistItemsContainer').innerHTML =
    pkg.scope
      .map(
        (item) => `
      <div class="flex items-center justify-between p-3 bg-white border ${item.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'} rounded-lg hover:border-brand transition">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <span class="item-handle admin-only cursor-grab text-slate-300 hover:text-slate-600" title="Drag to reorder"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>
          <input type="checkbox" data-change="toggle-item" data-pkg="${esc(pkg.id)}" data-item="${esc(item.id)}" ${item.completed ? 'checked' : ''} ${admin ? '' : 'disabled'} class="w-4 h-4 accent-brand" aria-label="Mark complete" />
          <span data-edit="scope-title" data-item="${esc(item.id)}" class="text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}">${esc(item.title)}</span>
        </div>
        <div class="admin-only flex items-center">
          ${ibtn('move-scope', `data-item="${esc(item.id)}" data-dir="-1"`, 'chevron-up', 'Move up')}
          ${ibtn('move-scope', `data-item="${esc(item.id)}" data-dir="1"`, 'chevron-down', 'Move down')}
          <button data-action="remove-scope" data-item="${esc(item.id)}" class="text-slate-400 hover:text-red-500 px-1" title="Remove item"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      </div>`
      )
      .join('') || `<p class="text-xs text-slate-400">No scope items yet.</p>`;

  // Template pickers (admin)
  const pick = (sel, list, cur) => {
    const el = $(sel);
    const chosen = ui.picks?.[sel] ?? cur ?? '';
    el.innerHTML = `<option value="">Choose a template…</option>` + list.map((t) => `<option value="${esc(t.id)}" ${t.id === chosen ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  };
  pick('#scopeTemplateSelect', state.scopeTemplates, pkg.scopeTemplateId);
  pick('#weeklyTemplateSelect', state.weeklyTemplates, pkg.weeklyTemplateId);

  // 2. Weekly breakdown: rows that cover the current week are highlighted
  const cur = state.currentWeek;
  const covers = (w) => { const r = parseWeekRange(w.week); return !!r && r[0] <= cur && cur <= r[1]; };
  const hit = pkg.weekly.filter(covers).length;
  $('#weeklyCurrentBanner').textContent = hit
    ? `Current week: W${cur}. The highlighted row${hit > 1 ? 's cover' : ' covers'} this week.`
    : `Current week: W${cur}. No row in this package covers this week${pkg.startWeek > cur ? ' (the package has not started yet)' : pkg.endWeek < cur ? ' (the package timeline has ended)' : ''}.`;
  const cell = (idx, key, val, extra = '') => `<td class="p-3 ${extra}" data-edit="weekly" data-idx="${idx}" data-key="${key}">${esc(val)}</td>`;
  $('#weeklyTableBody').innerHTML =
    pkg.weekly
      .map((w, idx) => {
        const now = covers(w);
        return `
      <tr class="${now ? 'bg-brand-50 shadow-[inset_4px_0_0_rgb(var(--brand))]' : 'hover:bg-slate-50'}" ${now ? 'aria-current="true"' : ''}>
        <td class="p-3 font-bold ${now ? 'text-brand-700' : 'text-slate-700'} whitespace-nowrap">
          <span data-edit="weekly" data-idx="${idx}" data-key="week">${esc(w.week)}</span>${now ? ' <span class="select-none ml-1 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-brand text-white align-middle">NOW</span>' : ''}
        </td>
        ${cell(idx, 'work', w.work, now ? 'font-semibold text-slate-900' : '')}
        ${cell(idx, 'client', w.client)}
        ${cell(idx, 'milestone', w.milestone, 'font-semibold text-brand-600')}
        ${cell(idx, 'files', w.files, 'text-slate-500')}
        ${cell(idx, 'notes', w.notes, 'text-slate-500')}
        <td class="p-3 text-center admin-only"><button data-action="remove-weekly" data-idx="${idx}" class="text-slate-400 hover:text-red-500" title="Remove row"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button></td>
      </tr>`;
      })
      .join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">No schedule rows yet.${ui.mode === 'admin' ? ' Pick a weekly template above or add a row.' : ''}</td></tr>`;

  // 3. Assets
  $('#assetsGrid').innerHTML =
    pkg.assets
      .map((a, idx) => {
        const url = safeUrl(a.url);
        const dl = url
          ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="p-1 hover:bg-slate-200 rounded text-slate-600" title="Open file"><i data-lucide="download" class="w-4 h-4"></i></a>`
          : `<span class="p-1 text-slate-300" title="No file linked yet"><i data-lucide="download" class="w-4 h-4"></i></span>`;
        return `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <i data-lucide="file-text" class="w-5 h-5 text-brand flex-shrink-0"></i>
            <div class="min-w-0">
              <p class="font-bold text-xs text-slate-800 truncate" data-edit="asset-name" data-idx="${idx}">${esc(a.name)}</p>
              <span class="text-[10px] text-slate-400">${esc(a.size || '')}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            ${dl}
            <button data-action="link-asset" data-idx="${idx}" class="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-brand admin-only" title="Set share link">Link</button>
            <button data-action="delete-asset" data-idx="${idx}" class="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500 admin-only" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
        </div>`;
      })
      .join('') || `<p class="text-xs text-slate-400 col-span-full">No files yet.</p>`;

  // 4. Intake form
  $('#templateSelector').disabled = !admin;
  renderIntake(pkg);
}

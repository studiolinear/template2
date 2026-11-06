import { state } from '../state.js';
import { $, esc } from '../utils.js';

export function renderTemplatesModal() {
  $('#templatesList').innerHTML = state.templates
    .map((t, idx) => {
      const qs = t.sections.reduce((n, s) => n + s.questions.length, 0);
      const used = state.packages.filter((p) => p.templateId === t.id).length;
      return `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h4 class="font-bold text-slate-800">${esc(t.title)}</h4>
          <p class="text-slate-500 text-[11px]">${esc(t.description)}</p>
          <p class="text-slate-400 text-[11px] mt-1">${t.sections.length} sections · ${qs} questions · used by ${used} package${used === 1 ? '' : 's'}</p>
        </div>
        <div class="flex gap-1.5 flex-shrink-0 text-[11px] font-bold">
          <button data-action="open-builder" data-id="${esc(t.id)}" class="px-2 py-1 bg-brand text-white rounded hover:bg-brand-600">Edit form</button>
          <button data-action="dup-template" data-idx="${idx}" class="px-2 py-1 border border-slate-300 rounded hover:border-brand text-slate-600">Duplicate</button>
          <button data-action="delete-template" data-idx="${idx}" class="px-2 py-1 border border-slate-300 rounded hover:text-red-600 hover:border-red-300 text-slate-500">Delete</button>
        </div>
      </div>`;
    })
    .join('');
}

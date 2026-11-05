import { state } from '../state.js';
import { $, esc } from '../utils.js';

export function renderTemplatesModal() {
  $('#templatesList').innerHTML = state.templates
    .map(
      (t, idx) => `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div class="flex justify-between items-center mb-1">
          <h4 class="font-bold text-slate-800" data-edit="tmpl-title" data-idx="${idx}">${esc(t.title)}</h4>
          <button data-action="delete-template" data-idx="${idx}" class="text-slate-400 hover:text-red-500 admin-only" title="Delete template"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
        <p class="text-slate-500 mb-2 text-[11px]" data-edit="tmpl-desc" data-idx="${idx}">${esc(t.description)}</p>
        <div class="space-y-1 pl-2 border-l-2 border-slate-200">
          ${t.fields.map((f) => `<div class="text-[11px] text-slate-600 font-medium">• ${esc(f.label)}</div>`).join('')}
        </div>
      </div>`
    )
    .join('');
}

import { state, ui } from '../state.js';
import { $, esc } from '../utils.js';

const IN = 'w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand outline-none bg-white';

export function renderTemplateEditor() {
  const tab = ui.tmplTab || 'scope';
  ['scope', 'weekly'].forEach((t) => {
    const b = $(`#tmpltab-${t}`);
    b.classList.toggle('border-brand', t === tab);
    b.classList.toggle('text-brand', t === tab);
    b.classList.toggle('border-transparent', t !== tab);
    b.classList.toggle('text-slate-500', t !== tab);
  });
  const host = $('#templateEditorBody');
  if (host.contains(document.activeElement) && document.activeElement !== host) return; // don't disturb typing

  if (tab === 'scope') {
    host.innerHTML = `
      <p class="text-slate-500 mb-3">One checklist item per line.</p>
      <div class="space-y-3">${state.scopeTemplates.map((t, i) => `
        <div class="p-3 border border-slate-200 rounded-lg bg-slate-50">
          <div class="flex gap-2 mb-2">
            <input class="${IN} font-bold" data-change="sc-tmpl" data-idx="${i}" data-key="name" value="${esc(t.name)}" />
            <button data-action="del-scope-tmpl" data-idx="${i}" class="px-2 border border-slate-300 rounded text-slate-500 hover:text-red-600 hover:border-red-300" title="Delete template">✕</button>
          </div>
          <textarea class="${IN}" rows="${Math.min(12, Math.max(4, t.items.length + 1))}" data-change="sc-tmpl" data-idx="${i}" data-key="items">${esc(t.items.join('\n'))}</textarea>
        </div>`).join('')}
      </div>
      <button data-action="add-scope-tmpl" class="mt-3 w-full py-2 bg-slate-100 border border-dashed border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded">+ New scope template</button>`;
  } else {
    host.innerHTML = `
      <p class="text-slate-500 mb-3">One week per line, in order: <b>our work | client needs to provide | milestone / review</b>. Week numbers are assigned automatically (week 1, 2, 3…).</p>
      <div class="space-y-3">${state.weeklyTemplates.map((t, i) => `
        <div class="p-3 border border-slate-200 rounded-lg bg-slate-50">
          <div class="flex gap-2 mb-2">
            <input class="${IN} font-bold" data-change="wk-tmpl" data-idx="${i}" data-key="name" value="${esc(t.name)}" />
            <button data-action="del-weekly-tmpl" data-idx="${i}" class="px-2 border border-slate-300 rounded text-slate-500 hover:text-red-600 hover:border-red-300" title="Delete template">✕</button>
          </div>
          <textarea class="${IN}" rows="${Math.min(12, Math.max(4, t.rows.length + 1))}" data-change="wk-tmpl" data-idx="${i}" data-key="rows">${esc(t.rows.map((r) => r.join(' | ')).join('\n'))}</textarea>
        </div>`).join('')}
      </div>
      <button data-action="add-weekly-tmpl" class="mt-3 w-full py-2 bg-slate-100 border border-dashed border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded">+ New weekly template</button>`;
  }
}

import { state, ui } from '../state.js';
import { $, esc } from '../utils.js';
import { QUESTION_TYPES, HAS_OPTIONS } from './forms.js';

const IN = 'w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand outline-none bg-white';
const btn = (action, attrs, label, title, extra = '') =>
  `<button data-action="${action}" ${attrs} title="${title}" class="px-1.5 py-0.5 text-[11px] border border-slate-300 rounded hover:border-brand text-slate-600 ${extra}">${label}</button>`;

export function renderBuilder() {
  const t = state.templates.find((x) => x.id === ui.builderTemplateId);
  $('#builderModal').classList.toggle('hidden', !t);
  if (!t) { $('#builderBody').innerHTML = ''; return; }

  $('#builderBody').innerHTML = `
    <div class="grid gap-3">
      <div><label class="block text-xs font-bold text-slate-700 mb-1">Form title</label>
        <input class="${IN}" data-change="bld-tmpl" data-key="title" value="${esc(t.title)}" /></div>
      <div><label class="block text-xs font-bold text-slate-700 mb-1">Form description</label>
        <textarea class="${IN}" rows="2" data-change="bld-tmpl" data-key="description">${esc(t.description)}</textarea></div>
    </div>
    ${t.sections
      .map(
        (s, si) => `
      <div class="border border-slate-200 rounded-lg p-3 bg-slate-50 mt-4">
        <div class="flex gap-2 items-start">
          <div class="flex-1 space-y-2">
            <input class="${IN} font-bold" placeholder="Section header" data-change="bld-sec" data-si="${si}" data-key="title" value="${esc(s.title)}" />
            <input class="${IN}" placeholder="Section description (optional)" data-change="bld-sec" data-si="${si}" data-key="description" value="${esc(s.description || '')}" />
          </div>
          <div class="flex gap-1">${btn('bld-move-sec', `data-si="${si}" data-dir="-1"`, '▲', 'Move section up')}${btn('bld-move-sec', `data-si="${si}" data-dir="1"`, '▼', 'Move section down')}${btn('bld-del-sec', `data-si="${si}"`, '✕', 'Delete section', 'hover:text-red-600')}</div>
        </div>
        ${s.questions
          .map(
            (q, qi) => `
          <div class="bg-white border border-slate-200 rounded p-2.5 mt-2 space-y-2">
            <div class="flex gap-2">
              <input class="${IN} flex-1" placeholder="Question" data-change="bld-q" data-si="${si}" data-qi="${qi}" data-key="label" value="${esc(q.label)}" />
              <select class="${IN} !w-44" data-change="bld-q" data-si="${si}" data-qi="${qi}" data-key="type">
                ${QUESTION_TYPES.map(([v, l]) => `<option value="${v}" ${v === q.type ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </div>
            ${HAS_OPTIONS.has(q.type)
              ? `<textarea class="${IN}" rows="3" placeholder="One option per line" data-change="bld-q" data-si="${si}" data-qi="${qi}" data-key="options">${esc((q.options || []).join('\n'))}</textarea>`
              : ''}
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" class="accent-brand" data-change="bld-q" data-si="${si}" data-qi="${qi}" data-key="required" ${q.required ? 'checked' : ''} /> Required</label>
              <div class="flex gap-1">${btn('bld-move-q', `data-si="${si}" data-qi="${qi}" data-dir="-1"`, '▲', 'Move up')}${btn('bld-move-q', `data-si="${si}" data-qi="${qi}" data-dir="1"`, '▼', 'Move down')}${btn('bld-del-q', `data-si="${si}" data-qi="${qi}"`, '✕', 'Delete question', 'hover:text-red-600')}</div>
            </div>
          </div>`
          )
          .join('')}
        <button data-action="bld-add-q" data-si="${si}" class="mt-2 text-xs font-bold text-brand hover:underline">+ Add question</button>
      </div>`
      )
      .join('')}
    <button data-action="bld-add-sec" class="mt-4 w-full py-2 bg-slate-100 border border-dashed border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs">+ Add section</button>`;
}

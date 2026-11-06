import { state, ui } from '../state.js';
import { store } from '../responses.js';
import { $, esc } from '../utils.js';

export const QUESTION_TYPES = [
  ['text', 'Short answer'],
  ['textarea', 'Paragraph'],
  ['dropdown', 'Dropdown'],
  ['radio', 'Multiple choice (pick one)'],
  ['checkbox', 'Checkboxes (pick many)'],
  ['date', 'Date'],
];
export const HAS_OPTIONS = new Set(['dropdown', 'radio', 'checkbox']);

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

const INPUT = 'w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none bg-white';

function control(q, val, pkgId) {
  const a = `data-ans="1" data-pkg="${esc(pkgId)}" data-q="${esc(q.id)}" data-type="${q.type}"`;
  const v = Array.isArray(val) ? '' : val ?? '';
  const opts = q.options || [];
  switch (q.type) {
    case 'textarea':
      return `<textarea ${a} rows="3" class="${INPUT}">${esc(v)}</textarea>`;
    case 'dropdown':
      return `<select ${a} class="${INPUT}"><option value="">Select…</option>${opts
        .map((o) => `<option value="${esc(o)}" ${o === v ? 'selected' : ''}>${esc(o)}</option>`)
        .join('')}</select>`;
    case 'radio':
      return `<div class="space-y-1.5">${opts
        .map((o) => `<label class="flex items-center gap-2 text-xs"><input type="radio" name="r-${esc(pkgId)}-${esc(q.id)}" value="${esc(o)}" ${a} ${o === v ? 'checked' : ''} class="accent-brand" /> ${esc(o)}</label>`)
        .join('')}</div>`;
    case 'checkbox': {
      const picked = Array.isArray(val) ? val : [];
      return `<div class="space-y-1.5">${opts
        .map((o) => `<label class="flex items-center gap-2 text-xs"><input type="checkbox" value="${esc(o)}" ${a} ${picked.includes(o) ? 'checked' : ''} class="accent-brand" /> ${esc(o)}</label>`)
        .join('')}</div>`;
    }
    case 'date':
      return `<input type="date" value="${esc(v)}" ${a} class="${INPUT}" />`;
    default:
      return `<input type="text" value="${esc(v)}" ${a} class="${INPUT}" />`;
  }
}

export function renderIntake(pkg) {
  const tmpl = state.templates.find((t) => t.id === pkg.templateId) || state.templates[0];
  const host = $('#intakeFormContainer');
  const sel = $('#templateSelector');
  sel.innerHTML = state.templates
    .map((t) => `<option value="${esc(t.id)}" ${t.id === tmpl?.id ? 'selected' : ''}>${esc(t.title)}</option>`)
    .join('');
  if (!tmpl) { host.innerHTML = ''; return; }

  const resp = store[pkg.id];
  const draft = ui.drafts[pkg.id] || {};
  const answers = { ...(resp?.answers || {}), ...(draft.answers || {}) };
  const name = draft.name ?? resp?.name ?? '';
  const email = draft.email ?? resp?.email ?? '';

  const banner = resp
    ? `<div class="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">Submitted ${esc(fmtDate(resp.updatedAt))}${resp.name ? ` by ${esc(resp.name)}` : ''}. You can edit your answers and submit again.</div>`
    : `<div class="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">Not submitted yet. Fill in the form below and press Submit.</div>`;

  const sections = tmpl.sections
    .map(
      (s) => `
      <div class="bg-white border border-slate-200 rounded-lg p-4">
        <h4 class="font-bold text-slate-900 text-sm">${esc(s.title)}</h4>
        ${s.description ? `<p class="text-xs text-slate-500 mt-0.5">${esc(s.description)}</p>` : ''}
        <div class="space-y-4 mt-3">
          ${s.questions
            .map(
              (q) => `
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">${esc(q.label)}${q.required ? ' <span class="text-brand">*</span>' : ''}</label>
              ${control(q, answers[q.id], pkg.id)}
            </div>`
            )
            .join('')}
        </div>
      </div>`
    )
    .join('');

  host.innerHTML = `
    <div class="mb-3">
      <h4 class="font-bold text-slate-900 text-base">${esc(tmpl.title)}</h4>
      ${tmpl.description ? `<p class="text-xs text-slate-500">${esc(tmpl.description)}</p>` : ''}
    </div>
    ${banner}
    <div class="grid sm:grid-cols-2 gap-3 mb-4">
      <div><label class="block text-xs font-bold text-slate-700 mb-1">Your name <span class="text-brand">*</span></label>
        <input type="text" data-draft="name" data-pkg="${esc(pkg.id)}" value="${esc(name)}" class="${INPUT}" /></div>
      <div><label class="block text-xs font-bold text-slate-700 mb-1">Email (optional)</label>
        <input type="email" data-draft="email" data-pkg="${esc(pkg.id)}" value="${esc(email)}" class="${INPUT}" /></div>
    </div>
    <div class="space-y-4">${sections}</div>
    <div class="flex flex-wrap gap-2 mt-5">
      <button data-action="submit-intake" data-id="${esc(pkg.id)}" class="px-4 py-2 bg-brand hover:bg-brand-600 text-white text-xs font-bold rounded shadow">${resp ? 'Update submission' : 'Submit form'}</button>
      <button data-action="export-pdf" data-id="${esc(pkg.id)}" class="px-4 py-2 bg-white border border-slate-300 hover:border-brand text-slate-700 text-xs font-bold rounded">Export PDF</button>
      ${resp ? `<button data-action="clear-response" data-id="${esc(pkg.id)}" class="admin-only px-4 py-2 bg-white border border-slate-300 hover:border-red-300 hover:text-red-600 text-slate-500 text-xs font-bold rounded">Clear submission</button>` : ''}
    </div>`;
}

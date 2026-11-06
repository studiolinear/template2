// "Export PDF" opens a print-ready page; choose "Save as PDF" in the print dialog.
import { state } from './state.js';
import { store } from './responses.js';
import { esc, pad } from './utils.js';
import { fmtDate } from './ui/forms.js';
import { toast } from './ui/toast.js';

const fmtAnswer = (v) => {
  const s = Array.isArray(v) ? v.join(', ') : String(v ?? '').trim();
  return s ? esc(s).replace(/\n/g, '<br>') : '<span class="none">No answer</span>';
};

function pkgDoc(pkg) {
  const r = store[pkg.id];
  const live = state.templates.find((t) => t.id === pkg.templateId) || state.templates[0];
  const tmpl = r?.snapshot || live;
  if (!tmpl) return '';
  return `
  <section class="doc">
    <p class="kicker">${esc(state.meta.projectName)} · ${pad(pkg.number)} ${esc(pkg.name)}</p>
    <h1>${esc(tmpl.title)}</h1>
    ${r ? `<p class="meta">Submitted by <b>${esc(r.name || 'Client')}</b>${r.email ? ` (${esc(r.email)})` : ''} · ${esc(fmtDate(r.updatedAt))}</p>` : '<p class="meta">Not submitted yet</p>'}
    ${tmpl.sections.map((s) => `
      <h2>${esc(s.title)}</h2>
      ${s.description ? `<p class="desc">${esc(s.description)}</p>` : ''}
      ${s.questions.map((q) => `<div class="q"><div class="ql">${esc(q.label)}</div><div class="qa">${fmtAnswer(r?.answers?.[q.id])}</div></div>`).join('')}
    `).join('')}
  </section>`;
}

export function exportPdf(pkgIds) {
  const pkgs = state.packages.filter((p) => pkgIds.includes(p.id) && store[p.id]);
  if (!pkgs.length) return toast('Nothing submitted yet for this package.');
  const w = window.open('', '_blank');
  if (!w) return toast('Please allow pop-ups to export the PDF.');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(state.meta.projectName)} – intake forms</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;margin:0;padding:32px;font-size:13px;line-height:1.45}
    .logo{max-height:48px;margin-bottom:16px}
    .doc{page-break-after:always;max-width:760px;margin:0 auto 40px}
    .doc:last-child{page-break-after:auto}
    .kicker{color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:0}
    h1{font-size:22px;margin:4px 0 6px}
    h2{font-size:15px;border-bottom:2px solid #cbd5e1;padding-bottom:4px;margin:22px 0 8px}
    .meta{color:#475569;margin:0 0 6px}.desc{color:#64748b;margin:0 0 8px}
    .q{margin:10px 0;page-break-inside:avoid}.ql{font-weight:700;margin-bottom:2px}
    .qa{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px}
    .none{color:#94a3b8;font-style:italic}
    @media print{body{padding:0}}
  </style></head><body>
  ${state.logo ? `<img class="logo" src="${esc(state.logo)}" alt="">` : ''}
  ${pkgs.map(pkgDoc).join('')}
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

import { $, esc } from '../utils.js';
import { fmtDate } from './forms.js';

export function renderInbox(data) {
  const host = $('#inboxBody');
  if (!data) { host.innerHTML = `<p class="text-xs text-slate-500">Could not load messages. Check your connection or admin token.</p>`; return; }
  const warn = data.emailConfigured ? '' : `<div class="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">Email is not configured on the server, so messages are only saved here and not emailed. See the README (RESEND_API_KEY).</div>`;
  const inq = (data.inquiries || []).slice().reverse();
  const sub = (data.submissions || []).slice().reverse();
  host.innerHTML = `${warn}
    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Questions from clients (${inq.length})</h4>
    <div class="space-y-2 mb-6">${inq.map((m) => `
      <div class="p-3 border border-slate-200 rounded-lg bg-white text-xs">
        <div class="flex justify-between gap-2"><b>${esc(m.name)}</b><span class="text-slate-400">${esc(fmtDate(m.at))}</span></div>
        <a class="text-brand hover:underline" href="mailto:${esc(m.email)}">${esc(m.email)}</a>
        <p class="mt-1 whitespace-pre-line text-slate-700">${esc(m.message)}</p>
        <p class="mt-1 text-[10px] ${m.emailed ? 'text-emerald-600' : 'text-slate-400'}">${m.emailed ? 'Emailed to the studio' : 'Not emailed'}</p>
      </div>`).join('') || '<p class="text-xs text-slate-400">No questions yet.</p>'}</div>
    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Client actions (${sub.length})</h4>
    <div class="space-y-2">${sub.map((m) => `
      <div class="p-3 border border-slate-200 rounded-lg bg-white text-xs">
        <div class="flex justify-between gap-2"><b>${esc(m.type)}</b><span class="text-slate-400">${esc(fmtDate(m.at))}</span></div>
        <p class="text-slate-400">Package: ${esc(m.packageId)}</p>
        <p class="mt-1 whitespace-pre-line text-slate-700">${esc(m.message)}</p>
      </div>`).join('') || '<p class="text-xs text-slate-400">No client actions yet.</p>'}</div>`;
}

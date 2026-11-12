import { createIcons, icons } from 'lucide';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// All user-editable text is escaped before being placed in innerHTML.
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const pad = (n) => String(n).padStart(2, '0');
export const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');
export const refreshIcons = () => createIcons({ icons });

export const STATUS = {
  completed: { label: 'Completed', bar: 'bg-emerald-500 hover:bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800', icon: 'text-emerald-500 fill-emerald-500' },
  'in-progress': { label: 'In progress', bar: 'bg-blue-600 hover:bg-blue-700', badge: 'bg-blue-100 text-blue-800', icon: 'text-blue-600 fill-blue-600' },
  waiting: { label: 'Waiting on client', bar: 'bg-amber-500 hover:bg-amber-600', badge: 'bg-amber-100 text-amber-800', icon: 'text-amber-500 fill-amber-500' },
  upcoming: { label: 'Upcoming', bar: 'bg-slate-400 hover:bg-slate-500', badge: 'bg-slate-100 text-slate-700', icon: 'text-slate-400' },
};

export const openModal = (id) => document.getElementById(id).classList.remove('hidden');
export const closeModal = (id) => document.getElementById(id).classList.add('hidden');

// "W6" -> [6,6]; "W2-W4" or "W2–W4" -> [2,4]; "5" -> [5,5]; anything else -> null
export function parseWeekRange(text) {
  const n = (String(text || '').match(/\d+/g) || []).map(Number);
  if (!n.length) return null;
  return [Math.min(n[0], n[n.length - 1]), Math.max(n[0], n[n.length - 1])];
}

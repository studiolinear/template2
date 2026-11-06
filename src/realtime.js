// Live updates over Server-Sent Events. The server pushes a tiny "something changed" message;
// we then re-fetch the data. Messages caused by this same browser tab are ignored.
import { clientId } from './api.js';

export function startRealtime(handlers) {
  if (typeof EventSource === 'undefined') return;
  const es = new EventSource('/api/events');
  let first = true;
  es.addEventListener('update', (e) => {
    try {
      const m = JSON.parse(e.data);
      if (m.source === clientId) return;
      handlers[m.type]?.();
    } catch { /* ignore malformed */ }
  });
  es.onopen = () => {
    if (!first) handlers.reconnect?.(); // we may have missed events while offline
    first = false;
  };
}

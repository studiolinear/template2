// Thin client for the Express API (server/index.js).
// If the API is not reachable (e.g. plain `vite` dev), the app falls back to localStorage-only mode.

const isJson = (r) => (r.headers.get('content-type') || '').includes('json');

export async function fetchState() {
  try {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (!r.ok || !isJson(r)) return { available: false, state: null };
    const j = await r.json();
    return { available: true, state: j.state ?? null };
  } catch {
    return { available: false, state: null };
  }
}

export async function verifyToken(token) {
  try {
    const r = await fetch('/api/auth', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return r.ok;
  } catch {
    return false;
  }
}

export async function saveState(state, token) {
  try {
    const r = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(state),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function submitAction(payload) {
  try {
    const r = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return r.ok;
  } catch {
    return false;
  }
}

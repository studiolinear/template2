// Thin client for the Express API (server/index.js).
// If the API is not reachable (e.g. plain `vite` dev), the app falls back to localStorage-only demo mode.

export const clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
const isJson = (r) => (r.headers.get('content-type') || '').includes('json');
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const jsonHeaders = { 'Content-Type': 'application/json', 'X-Client-Id': clientId };

async function get(url, token) {
  try {
    const r = await fetch(url, { cache: 'no-store', headers: token ? auth(token) : {} });
    if (!r.ok || !isJson(r)) return null;
    return await r.json();
  } catch {
    return null;
  }
}
async function send(method, url, body, token) {
  try {
    const r = await fetch(url, {
      method,
      headers: { ...jsonHeaders, ...(token ? auth(token) : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return r.ok ? await r.json().catch(() => ({ ok: true })) : null;
  } catch {
    return null;
  }
}

export async function fetchState() {
  const j = await get('/api/state');
  return j ? { available: true, state: j.state ?? null } : { available: false, state: null };
}
export const verifyToken = async (token) => !!(await send('POST', '/api/auth', undefined, token));
export const saveState = async (state, token) => !!(await send('PUT', '/api/state', state, token));

export async function fetchResponses() {
  const j = await get('/api/responses');
  return j ? j.responses || {} : null;
}
export const saveResponse = (pkgId, payload) => send('PUT', `/api/responses/${encodeURIComponent(pkgId)}`, payload);
export const deleteResponse = (pkgId, token) => send('DELETE', `/api/responses/${encodeURIComponent(pkgId)}`, undefined, token);

export const submitAction = async (payload) => !!(await send('POST', '/api/submissions', payload));
export const sendInquiry = (payload) => send('POST', '/api/inquiries', payload);
export const fetchInbox = (token) => get('/api/inbox', token);

import './styles.css';
import { state, ui, applyState, persist, resetHistory, LS_KEY, TOKEN_KEY } from './state.js';
import * as api from './api.js';
import { renderAll } from './render.js';
import { bindEvents } from './actions.js';
import { loadResponses } from './responses.js';
import { startRealtime } from './realtime.js';
import { toast } from './ui/toast.js';

let lastStateJson = '';

// Don't overwrite what the admin is in the middle of typing
const adminIsEditing = () =>
  ui.mode === 'admin' && !!document.activeElement?.closest?.('[contenteditable="true"], #builderModal, #settingsModal, #templateEditorModal');

async function refreshState() {
  const r = await api.fetchState();
  if (!r.state) return;
  const json = JSON.stringify(r.state);
  if (json === lastStateJson || adminIsEditing()) return;
  lastStateJson = json;
  applyState(r.state);
  resetHistory();
  renderAll();
}

async function refreshResponses() {
  await loadResponses();
  // Skip while someone is typing in the form; their draft is kept and the page refreshes after they submit
  if (!document.activeElement?.closest?.('#intakeFormContainer')) renderAll();
}

async function init() {
  const params = new URLSearchParams(location.search);
  const forceClient = params.get('view') === 'client';

  const remote = await api.fetchState();
  ui.apiAvailable = remote.available;

  let initial = remote.state;
  if (!initial && !ui.apiAvailable) {
    try { initial = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { initial = null; }
  }
  applyState(initial);
  lastStateJson = JSON.stringify(remote.state);

  if (!ui.apiAvailable) {
    ui.mode = forceClient ? 'client' : 'admin'; // demo mode, like the original single-file app
  } else {
    ui.token = localStorage.getItem(TOKEN_KEY);
    if (params.get('mode') === 'admin' && !ui.token) {
      const t = prompt('Enter the admin token:');
      if (t && (await api.verifyToken(t))) { ui.token = t; localStorage.setItem(TOKEN_KEY, t); }
    }
    const ok = ui.token && (await api.verifyToken(ui.token));
    if (!ok) { ui.token = null; localStorage.removeItem(TOKEN_KEY); }
    ui.mode = ok && !forceClient ? 'admin' : 'client';
  }

  await loadResponses();
  resetHistory();
  bindEvents();
  renderAll();

  // First deploy: seed the server with the default project so clients see it.
  if (ui.apiAvailable && ui.mode === 'admin' && !remote.state) persist();

  if (ui.apiAvailable) {
    // Live updates from other devices; the 60s poll is only a safety net.
    startRealtime({
      state: refreshState,
      responses: refreshResponses,
      inbox: () => { if (ui.mode === 'admin') toast('New message in your inbox'); },
      reconnect: () => { refreshState(); refreshResponses(); },
    });
    setInterval(() => { if (ui.mode === 'client') { refreshState(); refreshResponses(); } }, 60000);
  }
}

init();

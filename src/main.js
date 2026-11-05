import './styles.css';
import Sortable from 'sortablejs';
import { state, ui, applyState, persist, LS_KEY, TOKEN_KEY } from './state.js';
import * as api from './api.js';
import { renderAll } from './render.js';
import { bindEvents } from './actions.js';
import { $ } from './utils.js';

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

  if (!ui.apiAvailable) {
    // Local/demo mode (no server): behaves like the original single-file app.
    ui.mode = forceClient ? 'client' : 'admin';
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

  bindEvents();

  const kpi = $('#kpiCardsContainer');
  Sortable.create(kpi, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    disabled: ui.mode !== 'admin',
    onEnd: () => {
      state.kpiOrder = [...kpi.children].map((c) => c.dataset.cardId);
      persist();
    },
  });

  renderAll();

  // First deploy: seed the server with the default project so clients see it.
  if (ui.apiAvailable && ui.mode === 'admin' && !remote.state) persist();

  // Clients pick up admin changes without reloading.
  if (ui.apiAvailable) {
    let last = JSON.stringify(remote.state);
    setInterval(async () => {
      if (ui.mode !== 'client') return;
      const r = await api.fetchState();
      const json = JSON.stringify(r.state);
      if (r.state && json !== last) { last = json; applyState(r.state); renderAll(); }
    }, 60000);
  }
}

init();

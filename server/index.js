import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const DIST = path.join(__dirname, '..', 'dist');

if (!ADMIN_TOKEN) console.warn('WARNING: ADMIN_TOKEN is not set. Nobody can unlock Admin mode or save changes.');

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
function isAdmin(req) {
  if (!ADMIN_TOKEN) return false;
  const m = /^Bearer (.+)$/.exec(req.get('authorization') || '');
  return !!m && crypto.timingSafeEqual(sha(m[1]), sha(ADMIN_TOKEN));
}
const requireAdmin = (req, res, next) => (isAdmin(req) ? next() : res.status(401).json({ error: 'unauthorized' }));

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}
async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data));
  await fs.rename(tmp, file); // atomic replace
}

// Tiny in-memory rate limit for the public submissions endpoint
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return res.status(429).json({ error: 'too many requests' });
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

app.get('/healthz', (_req, res) => res.send('ok'));

// Public: anyone with the link can read the dashboard
app.get('/api/state', wrap(async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ state: await readJson(STATE_FILE, null) });
}));

// Admin: verify a token
app.post('/api/auth', requireAdmin, (_req, res) => res.json({ ok: true }));

// Admin: save the dashboard
app.put('/api/state', requireAdmin, wrap(async (req, res) => {
  const b = req.body;
  if (!b || !Array.isArray(b.packages) || !Array.isArray(b.months) || !Array.isArray(b.templates)) {
    return res.status(400).json({ error: 'invalid state' });
  }
  await writeJson(STATE_FILE, b);
  res.json({ ok: true });
}));

// Public: clients send uploads/approvals/revision requests
app.post('/api/submissions', rateLimit, wrap(async (req, res) => {
  const { type, packageId, message } = req.body || {};
  if (!['upload', 'approve', 'request'].includes(type) || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'invalid submission' });
  }
  const list = await readJson(SUBMISSIONS_FILE, []);
  list.push({ type, packageId: String(packageId || '').slice(0, 100), message: message.slice(0, 5000), at: new Date().toISOString() });
  await writeJson(SUBMISSIONS_FILE, list.slice(-500));
  res.json({ ok: true });
}));

// Admin: read submissions
app.get('/api/submissions', requireAdmin, wrap(async (_req, res) => res.json(await readJson(SUBMISSIONS_FILE, []))));

app.use(express.static(DIST, { setHeaders: (res, p) => p.endsWith('.html') && res.set('Cache-Control', 'no-cache') }));
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'server error' }); });

app.listen(PORT, '0.0.0.0', () => console.log(`HEADCHANGE dashboard listening on :${PORT} (data: ${DATA_DIR})`));

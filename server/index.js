import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const FILES = {
  state: path.join(DATA_DIR, 'state.json'),
  responses: path.join(DATA_DIR, 'responses.json'),
  submissions: path.join(DATA_DIR, 'submissions.json'),
  inquiries: path.join(DATA_DIR, 'inquiries.json'),
};
const DIST = path.join(__dirname, '..', 'dist');

// Email for the "Have a question?" form (sent through Resend's HTTPS API)
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const INQUIRY_TO = process.env.INQUIRY_TO || 'inquiries@studiolinear.com';
const INQUIRY_FROM = process.env.INQUIRY_FROM || 'Studio Linear Dashboard <onboarding@resend.dev>';

if (!ADMIN_TOKEN) console.warn('WARNING: ADMIN_TOKEN is not set. Nobody can unlock Admin mode or save changes.');
if (!RESEND_API_KEY) console.warn('NOTE: RESEND_API_KEY is not set. Inquiries are saved but not emailed.');

// ---------- helpers ----------
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
function isAdmin(req) {
  if (!ADMIN_TOKEN) return false;
  const m = /^Bearer (.+)$/.exec(req.get('authorization') || '');
  return !!m && crypto.timingSafeEqual(sha(m[1]), sha(ADMIN_TOKEN));
}
const requireAdmin = (req, res, next) => (isAdmin(req) ? next() : res.status(401).json({ error: 'unauthorized' }));
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}
async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data));
  await fs.rename(tmp, file); // atomic replace
}

// Serialize read-modify-write on the same file so concurrent requests don't overwrite each other
const locks = new Map();
function withLock(file, fn) {
  const next = (locks.get(file) || Promise.resolve()).then(fn, fn);
  locks.set(file, next.catch(() => {}));
  return next;
}

function limiter(max) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
    if (recent.length >= max) return res.status(429).json({ error: 'too many requests' });
    recent.push(now);
    hits.set(req.ip, recent);
    next();
  };
}

// ---------- realtime (Server-Sent Events) ----------
const listeners = new Set();
function broadcast(type, req) {
  const msg = `event: update\ndata: ${JSON.stringify({ type, source: req?.get?.('x-client-id') || '' })}\n\n`;
  listeners.forEach((res) => res.write(msg));
}
setInterval(() => listeners.forEach((res) => res.write(': keep-alive\n\n')), 25_000);

async function sendEmail({ subject, text, replyTo }) {
  if (!RESEND_API_KEY) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: INQUIRY_FROM, to: [INQUIRY_TO], reply_to: replyTo, subject, text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { console.error('Email failed', r.status, await r.text()); return false; }
    return true;
  } catch (e) {
    console.error('Email error', e);
    return false;
  }
}

// ---------- app ----------
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '5mb' }));

app.get('/healthz', (_req, res) => res.send('ok'));

app.get('/api/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  res.write('retry: 3000\n\n');
  listeners.add(res);
  req.on('close', () => listeners.delete(res));
});

// Dashboard data: anyone with the link can read; only the admin can write
app.get('/api/state', wrap(async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ state: await readJson(FILES.state, null) });
}));
app.post('/api/auth', requireAdmin, (_req, res) => res.json({ ok: true }));
app.put('/api/state', requireAdmin, wrap(async (req, res) => {
  const b = req.body;
  if (!b || !Array.isArray(b.packages) || !Array.isArray(b.months) || !Array.isArray(b.templates)) {
    return res.status(400).json({ error: 'invalid state' });
  }
  await writeJson(FILES.state, b);
  broadcast('state', req);
  res.json({ ok: true });
}));

// Intake form answers: clients can submit; everyone can read; admin can clear
const PKG_ID = /^[\w-]{1,80}$/;
app.get('/api/responses', wrap(async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ responses: await readJson(FILES.responses, {}) });
}));
app.put('/api/responses/:id', limiter(30), wrap(async (req, res) => {
  const { id } = req.params;
  const { answers, name, email, templateId, snapshot } = req.body || {};
  if (!PKG_ID.test(id) || !answers || typeof answers !== 'object' || Array.isArray(answers) || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'invalid response' });
  }
  if (JSON.stringify(req.body).length > 300_000) return res.status(413).json({ error: 'too large' });
  const now = new Date().toISOString();
  const saved = await withLock(FILES.responses, async () => {
    const all = await readJson(FILES.responses, {});
    all[id] = {
      answers, name: name.trim().slice(0, 100), email: String(email || '').slice(0, 200),
      templateId: String(templateId || '').slice(0, 100), snapshot: snapshot && typeof snapshot === 'object' ? snapshot : undefined,
      submittedAt: all[id]?.submittedAt || now, updatedAt: now,
    };
    await writeJson(FILES.responses, all);
    return all[id];
  });
  broadcast('responses', req);
  res.json({ ok: true, response: saved });
}));
app.delete('/api/responses/:id', requireAdmin, wrap(async (req, res) => {
  await withLock(FILES.responses, async () => {
    const all = await readJson(FILES.responses, {});
    delete all[req.params.id];
    await writeJson(FILES.responses, all);
  });
  broadcast('responses', req);
  res.json({ ok: true });
}));

// Client portal actions (upload / approve / revisions)
app.post('/api/submissions', limiter(10), wrap(async (req, res) => {
  const { type, packageId, message } = req.body || {};
  if (!['upload', 'approve', 'request'].includes(type) || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'invalid submission' });
  }
  await withLock(FILES.submissions, async () => {
    const list = await readJson(FILES.submissions, []);
    list.push({ type, packageId: String(packageId || '').slice(0, 100), message: message.slice(0, 5000), at: new Date().toISOString() });
    await writeJson(FILES.submissions, list.slice(-500));
  });
  broadcast('inbox', req);
  res.json({ ok: true });
}));

// "Have a question?" form: saved, then emailed to INQUIRY_TO
app.post('/api/inquiries', limiter(5), wrap(async (req, res) => {
  const { name, email, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: silently drop bots
  const ok = (v, max) => typeof v === 'string' && v.trim() && v.length <= max;
  if (!ok(name, 100) || !ok(message, 5000) || !ok(email, 200) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'invalid inquiry' });
  }
  const inq = { name: name.trim(), email: email.trim(), message: message.trim(), at: new Date().toISOString(), emailed: false };
  inq.emailed = await sendEmail({
    subject: `Dashboard question from ${inq.name}`.replace(/[\r\n]+/g, ' '),
    text: `From: ${inq.name} <${inq.email}>\n\n${inq.message}`,
    replyTo: inq.email,
  });
  await withLock(FILES.inquiries, async () => {
    const list = await readJson(FILES.inquiries, []);
    list.push(inq);
    await writeJson(FILES.inquiries, list.slice(-500));
  });
  broadcast('inbox', req);
  res.json({ ok: true, emailed: inq.emailed });
}));

app.get('/api/inbox', requireAdmin, wrap(async (_req, res) => {
  res.json({
    emailConfigured: !!RESEND_API_KEY,
    inquiries: await readJson(FILES.inquiries, []),
    submissions: await readJson(FILES.submissions, []),
  });
}));

app.use(express.static(DIST, { setHeaders: (res, p) => p.endsWith('.html') && res.set('Cache-Control', 'no-cache') }));
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'server error' }); });

app.listen(PORT, '0.0.0.0', () => console.log(`HEADCHANGE dashboard listening on :${PORT} (data: ${DATA_DIR})`));

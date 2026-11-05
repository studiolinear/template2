# HEADCHANGE Project Dashboard (Studio Linear)

Vite + Tailwind front end, with a small Express server that serves the built app and stores the dashboard data.

```
├── index.html              HTML shell (header, KPI cards, sections, modals)
├── src/
│   ├── main.js             Boot: load data, resolve Admin/Client mode, start app
│   ├── state.js            State, status/percentage recalculation, saving
│   ├── data.js             Default project data
│   ├── api.js              Calls to the server API
│   ├── actions.js          All click / change / inline-edit handlers
│   ├── render.js           Renders everything
│   ├── ui/                 kpis, inProgress (new), gantt, detail, drawer, templates, toast
│   └── styles.css          Tailwind + custom CSS
├── server/index.js         Express: static files + /api (state, auth, submissions)
├── nixpacks.toml · railway.json   Railway config
└── .env.example
```

## Run locally

```bash
npm install
npm run dev                 # app on http://localhost:5173 (demo mode: browser localStorage, always Admin)
```

To test the real Admin/Client flow locally, in a second terminal:

```bash
cp .env.example .env        # then set ADMIN_TOKEN
ADMIN_TOKEN=test123 npm run dev:server
```
Open http://localhost:5173/?mode=admin and enter `test123`.

Production check: `npm run build && ADMIN_TOKEN=test123 npm start` → http://localhost:3000

## How Admin vs Client works

| Link | What it shows |
|---|---|
| `https://YOUR-DOMAIN/` or `/?view=client` | Client view-only (default for everyone) |
| `https://YOUR-DOMAIN/?mode=admin` | Asks for `ADMIN_TOKEN` once, then unlocks editing on that browser |

Edits are saved to the server (`state.json`), so clients always see the latest. Only requests carrying the admin token can save; hiding buttons in the UI is not the security.
Client form submissions are stored in `submissions.json`; read them with
`curl -H "Authorization: Bearer YOUR_TOKEN" https://YOUR-DOMAIN/api/submissions`.

## Deploy: GitHub

```bash
git init
git add .
git commit -m "Initial commit: HEADCHANGE dashboard"
git branch -M main
# Option A: GitHub CLI
gh repo create headchange-dashboard --private --source=. --push
# Option B: create an empty repo at github.com/new, then:
git remote add origin https://github.com/YOUR-USER/headchange-dashboard.git
git push -u origin main
```

## Deploy: Railway

1. railway.com → **New Project** → **Deploy from GitHub repo** → authorize GitHub and pick `headchange-dashboard`.
2. Railway detects Node, runs `npm run build`, then `npm start`.
3. Service → **Variables** → add `ADMIN_TOKEN` (long random string, e.g. `openssl rand -hex 24`).
4. Add a **Volume** to the service, mount path `/data`, and add variable `DATA_DIR=/data`. Without a volume, saved data is lost on every redeploy.
5. Service → **Settings → Networking → Generate Domain**. Your links:
   - Client: `https://<generated>.up.railway.app/`
   - Admin: `https://<generated>.up.railway.app/?mode=admin`
6. Custom domain: **Settings → Networking → Custom Domain**, enter e.g. `dashboard.studiolinear.com`, then add the CNAME record Railway shows at your DNS provider. HTTPS is automatic.

Every `git push` to `main` redeploys automatically.

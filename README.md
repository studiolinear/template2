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
│   ├── theme.js            Theme color -> CSS variables
│   ├── responses.js        Client intake-form answers
│   ├── realtime.js         Live updates (SSE)
│   ├── pdf.js              Export submitted forms to PDF
│   ├── sortables.js        Drag-and-drop
│   ├── ui/                 kpis, inProgress, gantt, detail, drawer, forms, builder, templates, inbox, toast
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
| `https://YOUR-DOMAIN/` or `/?view=client` | Client view (read-only dashboard; clients can fill in intake forms and send messages) |
| `https://YOUR-DOMAIN/?mode=admin` | Asks for `ADMIN_TOKEN` once, then unlocks editing on that browser |

Edits are saved on the server, so every device sees the latest version **live** (Server-Sent Events, no refresh needed). Only requests with the admin token can change the dashboard.

## Features added in this version

- **Week adjustment:** each timeline row has start `‹ ›` and end `‹ ›` buttons, plus Start/End week boxes in the package header.
- **Intake form builder:** Intake Forms → Edit form. Sections with headers; question types: short answer, paragraph, dropdown, multiple choice, checkboxes, date; required flag; reorder with arrows. Clients fill in the form on the package's Intake tab and press Submit. Answers are stored on the server and show on every device. **Export PDF** opens a print-ready page; choose "Save as PDF". Admin can also export all packages and clear a submission.
- **Undo / Redo** (header buttons, Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z). History lasts until you reload the page. Logo and color changes are not part of undo.
- **Reorder** packages in the timeline (drag the handle or use ▲▼) and scope checklist items (drag or ▲▼). Package numbers follow the order.
- **Customize** (header): upload a logo and pick the theme color.
- **Have a question?** section: messages are saved (Admin → Inbox) and emailed to `inquiries@studiolinear.com`.

## Email setup (for the "Have a question?" form)

Railway blocks normal SMTP on most plans, so the server sends through Resend's web API.

1. Create a free account at resend.com and add/verify the domain `studiolinear.com` (add the DNS records they show).
2. Create an API key.
3. In Railway → Variables add:
   - `RESEND_API_KEY` = your key
   - `INQUIRY_TO` = `inquiries@studiolinear.com`
   - `INQUIRY_FROM` = `Studio Linear Dashboard <dashboard@studiolinear.com>` (must be on the verified domain)
4. Redeploy. Until a domain is verified, Resend only lets you send test emails to your own account address.

Without `RESEND_API_KEY`, messages are still saved and visible in the Inbox, but nothing is emailed (the Inbox shows a warning).

**Privacy note:** anyone with the client link can see the dashboard and submitted intake answers. Share the link only with the client. Never put passwords in the forms.

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
3. Service → **Variables** → add `ADMIN_TOKEN` (long random string, e.g. `openssl rand -hex 24`). Add the email variables too (see Email setup above).
4. Add a **Volume** to the service, mount path `/data`, and add variable `DATA_DIR=/data`. Without a volume, saved data is lost on every redeploy.
5. Service → **Settings → Networking → Generate Domain**. Your links:
   - Client: `https://<generated>.up.railway.app/`
   - Admin: `https://<generated>.up.railway.app/?mode=admin`
6. Custom domain: **Settings → Networking → Custom Domain**, enter e.g. `dashboard.studiolinear.com`, then add the CNAME record Railway shows at your DNS provider. HTTPS is automatic.

Every `git push` to `main` redeploys automatically.

# MEG Enterprises — megentllc.com

Company site + owner dashboard for **MEG Enterprises, LLC** — the independent record label and
family-founded entertainment company founded by Dr. Glenda S. Williams, now led by Dashaun Grey.
Dashaun's artist site lives one level up at `../artists/DashaunGrey/site` (dashaungrey.com).

Next.js 16 · React 19 · Tailwind v4 · TypeScript · Postgres (Neon/Supabase) with a JSON dev store.

```
cd path/to/MEG/site
npm install
npm run dev            # http://localhost:4990   dashboard: /admin
```

First run locally: open http://localhost:4990/admin/setup and create the owner account
(dev mode needs no token). Data lives in `data/meg-db.json` until `DATABASE_URL` is set.

## Deploy (Vercel)

1. Push this folder to a GitHub repo (it is its own git repo — `git remote add origin …`).
2. Vercel → Add New Project → import the repo. Framework: Next.js. No build settings needed.
3. Storage → Create Database → **Neon Postgres** → connect to the project. That injects `DATABASE_URL`.
4. Environment Variables (Production):
   - `SESSION_SECRET` — 32+ random chars: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
   - `ADMIN_EMAIL` + `ADMIN_PASSWORD` — the first owner is created automatically on first admin visit
     (or set `ADMIN_SETUP_TOKEN` and use /admin/setup in the browser instead)
   - optional: `NOTIFY_WEBHOOK` (Zapier / Make / Slack / Telegram relay — gets every inquiry + submission as JSON),
     `NEXT_PUBLIC_SITE_URL=https://megentllc.com`, `NEXT_PUBLIC_DASHAUN_URL=https://dashaungrey.com`
5. Domains → add `megentllc.com` (+ `www`), point DNS at Vercel.
6. Sign in at https://megentllc.com/admin → Team → add Dashaun as a second owner → Settings → contact emails + socials.

Health check: `/api/health` reports the database backend and connectivity.

## Scripts

- `python scripts/make-logo.py` — regenerate brand PNG/SVG/icons from the original lockup JPG
- `node scripts/make-og.mjs` — regenerate the share card
- `node scripts/verify-viewports.mjs [desktop|phone] [filter]` — screenshot every page (needs dev server)
- `node scripts/e2e-admin.mjs` — end-to-end smoke of the dashboard (needs dev server)

See `OPUS-HANDOFF.md` for architecture, conventions and what is left. See `ASSET-PROMPTS.md` for images/video.

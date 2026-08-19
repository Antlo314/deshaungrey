# MEG Enterprises, LLC — the parent company

```
Lumen/MEG/
├─ site/                     megentllc.com — Next.js 16 company site + owner dashboard  (its own git repo)
├─ artists/
│  └─ DashaunGrey/           dashaungrey.com — the artist page under MEG (its own git repo, was Lumen/DashawnGrey)
├─ meg.txt                   the company bio everything is written from
└─ README.md                 this file
```

- Company site: `cd site && npm run dev` → http://localhost:4990 · dashboard at /admin
- Artist site:  `cd artists/DashaunGrey/site && npm run dev` → http://localhost:3000
- **Push MEG to GitHub the first time:** create an empty PRIVATE repo at https://github.com/new
  (suggested name `meg-enterprises`, no README/gitignore/licence), then run `PUSH-MEG.bat`.
  Private is recommended — `site/OPUS-HANDOFF.md` documents internal Lumen fleet paths and ports.
  The Dashaun artist site is already pushed (github.com/Antlo314/deshaungrey, branch `main`).
- Read `site/OPUS-HANDOFF.md` before touching the company site; `artists/DashaunGrey/site/FABLE-HANDOFF.md` before the artist site.
- Image / video prompts for every visual slot: `site/ASSET-PROMPTS.md`.

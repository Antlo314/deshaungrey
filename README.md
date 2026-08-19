# MEG Enterprises, LLC

The company is the parent, so the repository is the company. One repo, two deployed sites.

```
MEG/                            <- the git repo root
├─ site/                        megentllc.com — company site + owner dashboard   (port 4990)
├─ artists/
│  └─ DashaunGrey/
│     ├─ site/                  dashaungrey.com — artist page under MEG          (port 3000)
│     ├─ assets/  wtda/         raw masters + bio assets — NOT in git, on purpose
│     └─ .claude/launch.json
├─ meg.txt                      the company bio everything is written from
├─ PUSH-MEG.bat                 first push helper
└─ .gitignore                   keeps masters, envs, node_modules and local DBs out
```

Run either app:

```
cd site && npm install && npm run dev                        # http://localhost:4990  (/admin)
cd artists/DashaunGrey/site && npm install && npm run dev    # http://localhost:3000
```

## Deploying two sites from one repo

Vercel supports this natively — create **two projects** from the same repository and set
**Root Directory** on each:

| Vercel project | Root Directory | Domain |
|---|---|---|
| meg-enterprises | `site` | megentllc.com |
| dashaun-grey | `artists/DashaunGrey/site` | dashaungrey.com |

Each project only rebuilds when its own folder changes if you enable "Only build when files
in the root directory change" (Settings → Git → Ignored Build Step).

## Rules that outlive any one session

- **Never commit the masters.** `artists/DashaunGrey/{assets,wtda}` hold full unreleased
  songs; the artist site deliberately serves 30-second previews only. The root `.gitignore`
  keeps them out — do not "fix" that.
- **Never commit a credential.** Both apps read secrets from env vars only. MEG's history was
  rewritten once, before its first push, to remove a password that had been hardcoded in a
  test script. Keep it that way.
- Read `site/OPUS-HANDOFF.md` before touching the company site, and
  `artists/DashaunGrey/site/FABLE-HANDOFF.md` before the artist site.
- Image and video prompts for every empty visual slot: `site/ASSET-PROMPTS.md`.

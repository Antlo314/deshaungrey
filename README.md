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

## Deploying

Only **megentllc.com** exists today, so only the `site/` app needs a Vercel project.

The repo root is the company, not an app, so Vercel would otherwise fail with
*"Couldn't find any `pages` or `app` directory"*. The root `vercel.json` handles that —
it installs and builds `site/` and points Vercel at `site/.next`. **No dashboard setting
is required.**

If a build ever misbehaves, the officially supported alternative is to set
**Settings → Build & Deployment → Root Directory → `site`**. Doing that makes Vercel treat
`site/` as the project root and ignore the root `vercel.json` entirely — the two approaches
do not fight.

When dashaungrey.com is registered, add a **second Vercel project** from this same repo with
Root Directory `artists/DashaunGrey/site`, and set `NEXT_PUBLIC_DASHAUN_URL` on the MEG project
so the roster links to it.

Environment variables the MEG project needs: `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`DATABASE_URL` (Vercel → Storage → Neon), and for ASH's voice `ELEVENLABS_API_KEY` +
`ELEVENLABS_VOICE_ID`. See `site/.env.example`.

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

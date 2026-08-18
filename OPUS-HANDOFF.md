# Handoff — MEG Enterprises site (megentllc.com)

Built by Fable on 2026-08-18. This document is the contract for whoever continues (Opus).
Read `AGENTS.md` (Next 16 is not the Next you know) and skim `app/globals.css` `:root` before touching anything.

## What this is

Two things in one Next.js 16 app:

1. **Public company site** for MEG Enterprises, LLC — independent record label · artist development · management.
   Home, The Legacy (`/legacy`), Artists (`/artists`, `/artists/[slug]`), Development (`/services`),
   Releases (`/releases`), Press + press kit (`/press`, `/press/[slug]`), Submit music (`/submit`), Contact (`/contact`).
2. **Owner dashboard** at `/admin` — inbox (inquiries), submissions (A&R), roster, releases, events, news, team, settings.

The Dashaun Grey artist site is a *separate* Next app at `../artists/DashaunGrey/site` with its own repo and
domain. MEG links out to it (roster card "Official site", `NEXT_PUBLIC_DASHAUN_URL`). Do not merge them.

## Truth rules (do not break)

- Every fact on the site comes from `../meg.txt` (company bio) or Dashaun's artist bio. **Never inflate**:
  "Grammy ballot consideration" not a win, "Billboard chart recognition" not a chart position, "B.B. King Award".
  No invented dates, addresses, staff, or artists. The only real contact is **services@megentllc.com · 678-750-3247**
  (owner-confirmed 2026-08-18) — seeded as the default in Settings; owners can change it there. No city is asserted.
- Real people: never generate a face for Dr. Glenda S. Williams or Dashaun Grey. Founder portrait slot is
  `components/FounderPortrait.tsx` → drop a real photo at `public/media/legacy/founder.jpg`.
- Roster/releases/press are DB-driven and owner-editable. Company copy (`lib/content.ts`) is code — the voice.

## Architecture

```
app/
  layout.tsx            fonts (Cormorant Garamond display · Geist UI · Oswald condensed), metadata, JSON-LD Organization
  globals.css           the whole public design system (tokens, reveal engine, nav, hero, sections, forms, footer, responsive)
  (site)/               public pages; layout = Preloader + Effects + announcement bar + Nav + Footer, force-dynamic
  admin/                admin.css + (auth)/login|setup and (app)/* behind the shell
  api/inquiries, api/submissions   public form endpoints (same-origin check, honeypot, rate limit, webhook fan-out)
  api/health            { ok, backend, ephemeral, detail }
  sitemap.ts robots.ts not-found.tsx
proxy.ts                Next 16 "middleware": signature+expiry gate for /admin/* (full user check happens in the (app) layout)
lib/
  content.ts            company copy, disciplines, steps, record, legacy timeline, nav, siteUrl() (production default megentllc.com)
  db/types.ts           every document type + SiteSettings defaults
  db/json-store.ts      dev store: data/meg-db.json (atomic writes, /tmp on serverless w/o DB)
  db/pg-store.ts        Postgres: ONE table `meg_documents(kind,id,data jsonb,…)`, auto-migrates, prepare:false (pooler safe)
  db/index.ts           store() picks backend by DATABASE_URL/POSTGRES_URL; ensureSeed(); ids; slugify
  db/seed.ts            first-run data (Dashaun, Show Me, WTDA, World Of Grey, 3 posts, settings) — also the public fallback if DB is down
  db/repo.ts            typed reads/writes; public reads never throw (fallback to seed)
  auth.ts               scrypt passwords, session cookie `meg_admin`, roles owner>admin>viewer, login throttle (5 fails/15 min), owner bootstrap
  session-token.ts      HMAC-SHA256 tokens via Web Crypto (shared by proxy + server); SESSION_SECRET (dev fallback only)
  actions/auth.ts       loginAction, logoutAction, setupOwnerAction
  actions/admin.ts      all CRUD server actions (requireRole → validate → save → audit → revalidatePath("/","layout") → redirect)
  public-api.ts         helpers for the public routes; notify() webhook
  motion.ts             reveal observer, letters(), useFinePointer, useMagnetic
components/
  Mark.tsx              <Profile/> (vector trace of the logo profile, from ProfilePath.ts) · <Wordmark/> · <Lockup/>
  Effects.tsx Preloader.tsx Nav.tsx Footer.tsx Hero.tsx GoldField.tsx PageHero.tsx Sections.tsx Forms.tsx FounderPortrait.tsx Icons.tsx
  admin/Shell.tsx (sidebar + <Top/>) Ui.tsx (SubmitButton, ConfirmForm, LinksEditor, Stars, SlugField) AuthForms InboundForms CatalogForms CompanyForms
scripts/                make-logo.py · make-og.mjs · verify-viewports.mjs · e2e-admin.mjs
public/media/brand      logo-full/profile/wordmark PNG + profile.svg (press kit) · media/roster · media/releases · og.jpg
```

**Data model:** documents by `kind` (artist, release, event, post, inquiry, submission, user, setting, audit,
auth_event). Both stores implement the same `Store` interface (`lib/db/types.ts`). Add a field = edit the type +
the form + the action; no migrations. Postgres indexes cover slug/email/created/updated.

**Auth flow:** `/admin/*` → proxy verifies cookie signature/expiry → `(app)/layout` does the DB lookup
(disabled? sessionVersion changed?) → pages call `getSession()`; every server action calls `requireRole()`
itself (never trust the layout). Sign-everyone-out = bump `sessionVersion`. Setup screen only exists while
there are zero users, and in production only with `ADMIN_SETUP_TOKEN` (or use `ADMIN_EMAIL`+`ADMIN_PASSWORD`).

**Motion language** (same family as the artist site): Lenis smooth scroll (fine pointer only), `.reveal/.reveal-clip/.reveal-x/.reveal-img/.reveal-lines/.st` + `useRevealObserver`, `--d` for stagger,
preloader once per session (`sessionStorage.meg_intro`) → `html.ready` fires hero letters (per-line stagger),
grain + vignette fixed overlays, `.progress` hairline. Reduced motion collapses everything.

**Design tokens** (`:root`): `--ink #050505`, `--panel`, `--gold #d4b36a` (`--gold-hi`, `--gold-dim`, `--gold-logo #e8c778`),
`--red #e4111c` (signal only: kicker dot, live pulse, NEW chips, wordmark dots), `--bone`, `--mute`, `--hair(-soft)`,
`--metal` / `--metal-text` gradients, `--display / --ui / --cond`, `--gutter`, `--nav-h`. Gold is metal, not neon.
Red is punctuation, never a wash. Kickers inside blocks that restyle `<p>` are protected by the override group near
the end of `globals.css` — add new block selectors there if a kicker ever turns grey.

## Verified

- `npm run build` clean; `eslint` 0 errors; `tsc` clean.
- Pre-push audit (25 agents, adversarially verified): no secrets in tracked files or history, gitignore
  covers env/data/private/.verify, no tracked file over 5 MB, no operator path or credential published.
- Desktop 1440 + phone 390 screenshots of every page in `.verify/` (`node scripts/verify-viewports.mjs`).
- `node scripts/e2e-admin.mjs`: gate → setup → bad password rejected → create post → post public → inquiry via
  /contact → submission via /submit → both appear in admin, handled, rated → settings save → reflected in footer/announce → sign out.

## What Opus should do next (routine, in order)

1. **Deploy.** This repo has 4 commits on `main` and no remote yet. Create an empty repo at github.com/new
   (suggest PRIVATE `meg-enterprises` — this doc names internal fleet paths/ports), then run `../PUSH-MEG.bat`
   (or `git remote add origin <url> && git push -u origin main`). Then Vercel import → Neon → env
   (`SESSION_SECRET`, `ADMIN_EMAIL/PASSWORD`, `NEXT_PUBLIC_SITE_URL`) → domain megentllc.com.
   Then hit `/api/health` and `/admin`. README has the exact steps.
   **Do not reuse a password that ever appeared in a tracked file** — history was rewritten once
   (filter-branch, pre-first-push) to remove exactly that; keep credentials in env vars only.
2. **Owner onboarding.** Add Dashaun as owner (Team), confirm Settings (services@megentllc.com / 678-750-3247 are pre-filled; add socials, city).
   Fill DSP links on the two singles (Releases) and Dashaun's socials (Roster) — same links the artist site needs
   (`../artists/DashaunGrey/site/lib/catalog.ts` → `dsps`, `socials`; keep them in sync by hand for now).
3. **Assets.** Work through `ASSET-PROMPTS.md`: hero plate (`public/media/hero/hero.mp4` + `hero-still.jpg`),
   founder photo (`public/media/legacy/founder.jpg` — drop-in), World Of Grey cover when it exists.
4. **Command deck orb.** Register MEG under Lumen in `LUMENCOMMAND/Command/server/index.js` (engine registry near the
   Tiffany entry ~L216, status probe ~L690, logo map ~L1388 → use `public/media/brand/logo-profile.png`) and
   `Command/public/js/agents.js`. Port 4990. Dashaun (port 3000) can hang under MEG as a child orb. Not required for launch.
5. **Nice-to-haves (only after 1–3):** `next/image` for roster/covers (currently `<img>` on purpose — paths are owner-entered
   strings that may be external), ISR instead of force-dynamic on public pages (`revalidate = 60` + keep the
   `revalidatePath` calls), a Resend/SMTP email hook next to `notify()` for reply-from-dashboard, media upload to Vercel Blob
   in the roster/release forms (today: paths/URLs), CSV export of inbox/submissions, Vercel Analytics tag in `app/layout.tsx`.

## Gotchas learned building it

- The React purity lint (react-hooks/purity) flags `Date.now()` in server components; use `lib/time.ts` `nowMs()`.
- Server actions that `redirect()` inside a try/catch must `unstable_rethrow(e)` first (see `wrap()` in `lib/actions/admin.ts`).
- Playwright screenshots: the in-app Browser pane does not composite when hidden — use `scripts/verify-viewports.mjs`
  (Playwright is resolved by `scripts/_playwright.mjs`: local install, `PLAYWRIGHT_ROOT`, or a sibling checkout).
- The Next dev-tools badge sits over the sidebar "Sign out" button in dev; e2e uses `form.requestSubmit()`.
- Windows: PowerShell `Move-Item` of a folder open as a shell cwd fails "in use"; robocopy /MOVE after `attrib -R` finished the
  DashawnGrey → MEG/artists/DashaunGrey move. Git repo verified intact (`git fsck`).
- The traced profile mark comes from the only logo file we have (`DrGlenda/public/assets/meg-ent.jpg`); if the owners
  supply a vector logo, replace `components/ProfilePath.ts` (or just the press-kit files) — see `scripts/make-logo.py`.

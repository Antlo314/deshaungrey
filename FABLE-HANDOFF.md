# Fable handoff — Dashaun Grey / World of Grey

Fable may restyle. Fable must not invent new APIs or break the catalog.

## What this is

A one-page cinematic artist site for **Dashaun Grey** (spelling on the covers and bio — not Dashawn). Two singles, six merch SKUs, an album teaser, an About, a MEG Enterprises label section, a tour waitlist, and **ASH**, a voice agent.

## Tokens (`app/globals.css` `:root`)

| Token | Value | Role |
|---|---|---|
| `--void` | `#070708` | Page ground |
| `--panel` | `#111114` | Cards |
| `--gold` | `#C9A46A` | Metal, rules, CTAs |
| `--gold-hi` | `#E9CF98` | Metal highlight |
| `--burgundy` | `#8B1E3F` | Show Me world |
| `--pink` | `#F2C1C8` | WTDA world |
| `--bone` | `#E8E2D6` | Type |
| `--mute` | `#8A847A` | Secondary type |
| `--hair` / `--hair-soft` | gold @ 28% / 12% | Rules |
| `--metal` / `--metal-text` | gold gradients | Sheen on bars, big numerals |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | Every reveal |
| `--gutter` | `min(7vw, 96px)` | Horizontal pad |
| `--display` | Cormorant Garamond | Titles |
| `--ui` | Geist | UI / nav |

A palette pass is a `:root` edit. Keep gold as metal, not neon.

## Motion language

- **Preloader** (`Preloader.tsx`) — "WORLD OF GREY" letters + counter, once per session (`sessionStorage.dg_intro`). Sets `html.ready`, which fires the hero letter reveal (`.st > span`).
- **Smooth scroll** — Lenis, desktop fine-pointer only, off for `prefers-reduced-motion`. `window.__lenis` exposed; use `scrollToId()` from `Effects.tsx` for in-page jumps.
- **Reveal on scroll** — add `.reveal`, `.reveal-clip`, `.reveal-x`, `.reveal-img`, `.reveal-lines`, or `.st` to any element; `useRevealObserver` (root, in `Effects`) adds `.in`. Stagger with `style={{"--d": "0.1s"}}`. Threshold is 0 on purpose: Chrome reports ratio 0 for `clip-path`'d targets.
- **Custom cursor** (`Cursor.tsx`) — gold dot + lagging ring, fine pointer only. `data-cursor="Play"` on any element shows a filled label ring.
- **Scroll progress** — 2px gold hairline at top (`.progress`).
- **Grain + vignette** — fixed overlays, grain is stepped-animated on desktop only.
- Reduced motion collapses every animation and shows content immediately (see the `@media (prefers-reduced-motion)` block and the `<noscript>` style in `layout.tsx`).

## Sections (in order — `app/page.tsx`)

1. `Preloader`, `Effects` (Lenis + progress + reveal observer)
2. `Nav` — fixed, hides on scroll-down / shows on scroll-up, blurs after 40px, active-section underline, **Listen** DSP dropdown, "Talk to Ash" opens the widget. Mobile: mark + Listen only; the `Dock` (bottom-left pill: Music / Merch / Tour) takes over.
3. `Hero` — 100svh cinema. Video `#top`. Letter reveal, mouse parallax on the plate, "New singles out now" badge, vertical side label, DSP row, animated scroll cue.
4. `Ticker` — gold marquee, alternating outline words, masked edges, pauses on hover.
5. `Chapter` ×2 — `#music` (`#show-me`) and `#wtda`. Sticky pin + scroll-scrubbed video on desktop. Still + loop on mobile. Ghost numeral, 3D-tilt cover with rotating text badge (click = play), DSP row + Share (Web Share / clipboard).
6. `Player` — **real Web Audio analyser** drives the 28 bars (CSS pulse fallback if the AudioContext fails), spinning disc, progress ring, `PREVIEW_CAP = 30`.
7. `MiniPlayer` — fixed bottom-left now-playing bar. Shows once a preview has started **and** its source `.player` is off-screen. Toggles through `player-store.toggleCurrent()`.
8. `Album` — `#album`. World of Grey teaser: animated "shades" wash, swatches, meta grid, italic genre marquee, notify (`interest: "album"`).
9. `About` — `#about`. Sticky official portrait with scroll parallax, copy, quote, **stats strip** and **timeline** (`lib/catalog.ts` → `stats`, `timeline`).
10. `Label` — `#label`. **MEG Enterprises** from `meg.txt` → `lib/catalog.ts` → `label`: intro, 30+ numeral, track-record list, "The next generation · 2019" hand-off, founder credit (Dr. Glenda S. Williams).
11. `MerchGrid` — `#merch`. World filter tabs, hover quick-notify, sizes, uniform 1:1 tiles. Six SKUs from `lib/catalog.ts`.
12. `TourDrop` — `#tour`. Ghost "ON THE ROAD" marquee, floating-label form, quick-pick city chips (hints only — never rendered as dates), drawn check on success. Notify form → `/api/notify`.
13. `Footer` — 4-column grid, social icons, giant outlined "GREY", back to top.
14. `Dock` (mobile), `AshWidget`, `Cursor`.

## ASH (`components/AshWidget.tsx`)

- Orb: conic gold/burgundy ring, twin halos, **audio-reactive live ring** (`--amp` from an analyser on the hello/timeout clips). Open state shows an ×.
- Teaser bubble once per session (`sessionStorage.dg_ash_tease`) at ~5s.
- Panel: avatar header + status pill, typewriter line, **12-pip quota meter** (functional — reads `/api/voice/quota`), suggestion chips (Play Show Me / Play WTDA / merch / tour / about — "Play" chips scroll and press the real play button), Talk live → `/api/voice/signed-url` → mounts `elevenlabs-convai`. Flow and quota logic are unchanged from the original build.

## Do not break

- 30-second preview cap (`components/Player.tsx`, `PREVIEW_CAP`)
- Exclusive audio + now-playing store (`lib/player-store.ts` — `claimAudio`, `releaseAudio`, `publish`, `subscribe`, `toggleCurrent`)
- ASH quota: 12 turns / 15 minutes (`lib/quota.ts`)
- SKU strings in `lib/catalog.ts` — Stripe and Printful read this file
- `/api/checkout` `stripe_unwired` fallback (button becomes notify, not a dead buy)
- Masters in `private/masters/` — never move them to `public/`
- Real-person likeness: only official photos / derived hero + Show Me plate. Do not generate a new face for Dashaun.
- Never render fake tour dates or venues. City chips are input hints only.

## Things the owner must supply

- **Streaming links** — `lib/catalog.ts` → `dsps` (Spotify, Apple Music, YouTube, Tidal, Amazon) are `"#"`. They render everywhere (nav Listen menu, hero, chapters, footer). Replace with real profile / track URLs.
- **Socials** — `lib/catalog.ts` → `socials` are `"#"`.
- Stripe: `STRIPE_SECRET_KEY` in `.env.local`. Checkout already posts line items from the catalog.
- Printful: set `printfulProductId` on each merch row + `PRINTFUL_API_KEY`.
- ASH live voice: create the agent from `VOICE.md`, set `ELEVENLABS_AGENT_ID` and `ELEVENLABS_VOICE_ID`.

## Asset inventory

| Path | Use |
|---|---|
| `/media/hero/hero-still.jpg` + `hero.mp4` | Hero |
| `/media/plates/show-me.jpg` + `.mp4` | Show Me chapter |
| `/media/plates/wtda.jpg` + `.mp4` | WTDA chapter |
| `/media/covers/show-me.jpg` | Cover + poster merch + tilt card |
| `/media/covers/wtda.jpg` | Cover + poster merch + tilt card |
| `/media/about/portrait.png` | About |
| `/media/ash/ash-portrait.jpg` | Widget |
| `/media/merch/*` | Product stills |
| `/audio/previews/*.m4a` | 30s clips |
| `/audio/ash/*.mp3` | Hello / timeout |
| `/prints/*.svg` | Printful print files |
| `/media/og.jpg` | Share card |

Ken Burns mp4s were built locally with ffmpeg. Swap the plates any time — keep 1920×1080, ~6s, no audio.

## Verify

`node scripts/verify-viewports.mjs [desktop|phone]` → `.verify/*.png` (desktop 1440×900 + phone 390×844, every section, ASH open, Listen menu, pinned chapter). Requires the dev server on :3000.

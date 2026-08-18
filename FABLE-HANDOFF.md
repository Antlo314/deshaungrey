# Fable handoff — Dashaun Grey / World of Grey

Fable may restyle. Fable must not invent new APIs or break the catalog.

## What this is

A one-page cinematic artist site for **Dashaun Grey** (spelling on the covers and bio — not Dashawn). Two singles, six merch SKUs, a tour waitlist, and **ASH**, a voice agent.

## Tokens (`app/globals.css` `:root`)

| Token | Value | Role |
|---|---|---|
| `--void` | `#070708` | Page ground |
| `--panel` | `#111114` | Cards |
| `--gold` | `#C9A46A` | Metal, rules, CTAs |
| `--burgundy` | `#8B1E3F` | Show Me world |
| `--pink` | `#F2C1C8` | WTDA world |
| `--bone` | `#E8E2D6` | Type |
| `--mute` | `#8A847A` | Secondary type |
| `--gutter` | `min(7vw, 96px)` | Horizontal pad |
| `--display` | Cormorant Garamond | Titles |
| `--ui` | Geist | UI / nav |

A palette pass is a `:root` edit. Keep gold as metal, not neon.

## Sections (in order)

1. `Nav` — mix-blend difference. Do not cover ASH.
2. `Hero` — 100svh cinema. Video `#top`.
3. `Ticker` — gold marquee.
4. `Chapter` ×2 — `#music`. Sticky pin + scroll-scrubbed video on desktop. Still + loop on mobile.
5. `About` — `#about`. Official tuxedo portrait.
6. `MerchGrid` — `#merch`. Six SKUs from `lib/catalog.ts`.
7. `TourDrop` — `#tour`. Notify form → `/api/notify`.
8. `Footer`
9. `AshWidget` — fixed orb. Quota chrome is functional, not decorative.

## Do not break

- 30-second preview cap (`components/Player.tsx`, `PREVIEW_CAP`)
- Exclusive audio (`lib/player-store.ts`)
- ASH quota: 12 turns / 15 minutes (`lib/quota.ts`)
- SKU strings in `lib/catalog.ts` — Stripe and Printful read this file
- `/api/checkout` `stripe_unwired` fallback (button becomes notify, not a dead buy)
- Masters in `private/masters/` — never move them to `public/`
- Real-person likeness: only official photos / derived hero + Show Me plate. Do not generate a new face for Dashaun.

## Asset inventory

| Path | Use |
|---|---|
| `/media/hero/hero-still.jpg` + `hero.mp4` | Hero |
| `/media/plates/show-me.jpg` + `.mp4` | Show Me chapter |
| `/media/plates/wtda.jpg` + `.mp4` | WTDA chapter |
| `/media/covers/show-me.jpg` | Cover + poster merch |
| `/media/covers/wtda.png` | Cover + poster merch |
| `/media/about/portrait.png` | About |
| `/media/ash/ash-portrait.jpg` | Widget |
| `/media/merch/*` | Product stills |
| `/audio/previews/*.m4a` | 30s clips |
| `/prints/*.svg` | Printful print files |
| `/media/og.jpg` | Share card |

Ken Burns mp4s were built locally with ffmpeg because Imagine video is blocked on this account (ZDR). Swap the plates any time — keep 1920×1080, ~6s, no audio.

## Tomorrow

- Stripe: `STRIPE_SECRET_KEY` in `.env.local`. Checkout already posts line items from the catalog.
- Printful: set `printfulProductId` on each merch row + `PRINTFUL_API_KEY`.
- ASH live voice: create the agent from `VOICE.md`, set `ELEVENLABS_AGENT_ID` and `ELEVENLABS_VOICE_ID`.

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
- **No custom cursor / mouse-follow.** Removed by request. The only pointer-driven motion left is the 3D tilt on the chapter cover art (hover-contained).
- **Scroll progress** — 2px gold hairline at top (`.progress`).
- **Grain + vignette** — fixed overlays, grain is stepped-animated on desktop only.
- Reduced motion collapses every animation and shows content immediately (see the `@media (prefers-reduced-motion)` block and the `<noscript>` style in `layout.tsx`).

## Sections (in order — `app/page.tsx`)

1. `Preloader`, `Effects` (Lenis + progress + reveal observer)
2. `Nav` — fixed, hides on scroll-down / shows on scroll-up, blurs after 40px, active-section underline, **Listen** DSP dropdown, "Talk to Ash" opens the widget. Mobile: mark + Listen only; the `Dock` (bottom-left pill: Music / Merch / Tour) takes over.
3. `Hero` — 100svh cinema. Video `#top`. Letter reveal, "New singles out now" badge, vertical side label, DSP row, animated scroll cue, **"As seen" press bar** (text wordmarks from `catalog.press`, no third-party logos).
4. `Ticker` — gold marquee, alternating outline words, masked edges, pauses on hover.
4b. `Honors` — `#honors`. **Awards-night band**: spotlight cone, four laurel cards from `catalog.honors`. Wording is deliberately truthful ("Grammy ballot consideration", not a win). Laurel SVG lives in `Laurel.tsx`.
5. `Chapter` ×2 — `#music` (`#show-me`) and `#wtda`. `.chapter-copy::before` lays a masked
   left-side scrim under the copy so type stays legible over any plate — the WTDA bathroom
   frame is bright, and gold-on-marble was unreadable without it. Headings, kicker and blurb
   also carry a soft text-shadow, and `.featured` uses `--gold-hi`. Sticky pin + scroll-scrubbed video on desktop. Still + loop on mobile. Ghost numeral, 3D-tilt cover with rotating text badge (click = play), DSP row + Share (Web Share / clipboard).
6. `Player` — **real Web Audio analyser** drives the 28 bars (CSS pulse fallback if the AudioContext fails), spinning disc, progress ring, `PREVIEW_CAP = 30`.
7. `MiniPlayer` — fixed bottom-left now-playing bar. Shows once a preview has started **and** its source `.player` is off-screen. Toggles through `player-store.toggleCurrent()`.
8. `Album` — `#album`. A Seedance ink loop (`/media/album/world-of-grey.mp4`, 1024×576,
   20s boomerang so it wraps seamlessly, ~1.5MB) plays behind the type. It is mounted only
   when the section is within 60% of the viewport and only on desktop `useCinema`, so it
   costs nothing on mobile or above the fold. `.album::after` lays a two-axis scrim over it
   so copy contrast never depends on the video. World of Grey teaser: animated "shades" wash, swatches, meta grid, italic genre marquee, notify (`interest: "album"`).
9. `About` — `#about`. Sticky official portrait with scroll parallax, copy, quote, **stats strip** and **timeline** (`lib/catalog.ts` → `stats`, `timeline`).
10. `Label` — `#label`. **MEG Enterprises** from `meg.txt` → `lib/catalog.ts` → `label`: intro, 30+ numeral, track-record list, "The next generation · 2019" hand-off, founder credit (Dr. Glenda S. Williams).
11. `MerchGrid` — `#merch`. World filter tabs, hover quick-notify, sizes, uniform 1:1 tiles. Six SKUs from `lib/catalog.ts`.
12. `TourDrop` — `#tour`. Ghost "ON THE ROAD" marquee, floating-label form, quick-pick city chips (hints only — never rendered as dates), drawn check on success. Notify form → `/api/notify`.
13. `Footer` — 4-column grid, social icons, giant outlined "GREY", back to top.
14. `Dock` (mobile), `AshWidget`.

## Awards-night layer (added on request — "Grammy winner's site")

- Metallic gradient on `.btn.solid`, diamond kicker markers, `.orn` ornament rules, stage-spotlight radial glows on `.honors/.label/.merch/.tour/.about-copy`, "MEG Enterprises presents" in the preloader + hero kicker, laurel seal in the footer.

## ASH (`components/AshWidget.tsx`)

- **ASH has no face.** She is an animated sphere — `.orb` in `globals.css`: a lit
  radial-gradient ball (gold specular → gold → burgundy → void rim), a rotating
  conic "liquid" swirl on `screen` blend, a blurred specular highlight, and an idle
  breathe. Speaking speeds the swirl and drives scale/opacity from `--amp`.
  The same `.orb` renders at 44px as `.orb-sm` in the panel header.
  **Never reintroduce a portrait**: no `avatar-image-url` on the ElevenLabs element,
  no photo in the orb. The old persona portrait is archived in
  `private/masters/originals/ash__*` and is no longer served.
- Orb chrome: conic gold/burgundy ring, twin halos, and an **audio-reactive glow**. Every
  clip she speaks is routed through a Web Audio analyser that writes `--amp` on the widget
  root; the orb core scales, the live ring expands, and a gold bloom tracks her voice. If the
  analyser is unavailable (autoplay policy, old browser) a synthesised pulse stands in, so the
  orb **always** moves while she talks. Open state shows an ×.

### She answers questions

- `POST /api/ash/ask` → `{ answer }`, three tiers:
  1. `lib/ash-brain.ts` — a grounded rule set covering tour/Grammy/Billboard/album/singles/
     merch/label/FaSho/name-change/illness/hometown/streaming/**booking**. Works with no API
     keys, free. The booking rule is hoisted near the top so "how do I contact Dashaun Grey"
     does not fall through to the bio rule. **TODO in `ash-brain.ts`: swap in MEG's real
     booking contact.** Until then she routes people to the list and never invents an address,
     a fee, or availability.
  2. If `ANTHROPIC_API_KEY` is set, Claude answers with `SYSTEM_PROMPT` + `FACT_SHEET` as its
     ONLY source of truth (capped at 500 calls/day). It cannot invent dates or call him a
     Grammy winner — the prompt forbids both.
  3. Otherwise she deflects in character rather than dead-ending.
- `POST /api/ash/speak` → `audio/mpeg` from ElevenLabs TTS. Server-side only, so the key is
  never exposed. **Capped at `VOICE_REPLY_CAP = 10` spoken replies per visitor per day**
  (`lib/quota.ts`), plus 400 chars/request and 120k chars/day globally. `GET` on the same
  route reports `{ left, cap, wired }` for free. Text answers are never capped — muting or
  running out only removes the audio.
- The panel header has a **speaker toggle**. Off = no TTS calls at all, including the cached
  greeting. The meter and pips track spoken replies, since that is the budget visitors spend.
- The panel has a conversation log, a text composer, and a **mic button** (Web Speech API,
  shown only where supported) so she can literally be spoken to. Replies are spoken back and
  the orb pulses with them.
- Bubble classes are `.from-you` / `.from-ash` on purpose — a bare `.ash` modifier collides
  with the widget root rule `.ash { position: fixed }` and throws replies out of the panel.
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
- ASH live voice: create the **Conversational Agent** from `VOICE.md` in the ElevenLabs
  dashboard and set `ELEVENLABS_AGENT_ID`. (The API key can do TTS and Voice Design but
  cannot create agents.) Until it is set, the widget falls back to the cached clips and
  the `agent_unwired` copy — it never dead-ends.

## ASH's voice

`scripts/design-ash-voice.mjs` designs her voice from the written description, saves
every preview to `private/masters/ash-voice/`, creates the voice on the ElevenLabs
account, writes `ELEVENLABS_VOICE_ID` into `.env.local`, and re-renders the cached
`public/audio/ash/hello.mp3` + `timeout.mp3`.

    node scripts/design-ash-voice.mjs                 # design + create + wire up
    node scripts/design-ash-voice.mjs --previews-only # just audition
    node scripts/design-ash-voice.mjs --use 1         # build from a different take

Direction (also in `VOICE.md`): young African-American woman, early twenties, rich warm
smoky lower register with a breathy edge, modern Atlanta cadence, playful and a little
flirtatious but always classy. Settings: stability 0.40, similarity 0.85, style 0.45,
speaker boost on.

## Imagery — retouch + 4K pipeline

- **Crosses removed** from the hero wall, the Show Me plate (wall + framed print), and the
  framed print in the Show Me **cover** — `scripts/retouch.py`. No generative fill; faces
  are never written to. Three stages:
  1. **Multigrid harmonic (Laplace) fill** — solves the membrane equation inside the mask
     with the surrounding pixels as an exact Dirichlet boundary. This is why there is no
     visible rectangle: a 1-D per-column interpolation (the first attempt) left a flat
     grey patch with hard edges and horizontal banding.
  2. **Multiplicative seam profile** — these walls are vertical paneling, so a 1-D profile
     over x sampled from clean donor rows in the *same columns* is broadcast down the fill,
     keeping panel seams and grain continuous.
  3. **Matched grain** — noise sigma measured off real wall nearby, so the patch is not
     smoother than its surroundings. Smoothness is what reads as "off pixels".
  Where the cross is occluded by a person (Show Me), `gold_mask()` finds the cross by hue
  and refuses to write right of each row's right-most gold pixel, so the mask stops exactly
  at his hairline. `*-mask.jpg` and `*-debug.jpg` proofs are written next to each output.
  It reads the archived originals, so it is idempotent. Originals live in
  `private/masters/originals/` (never public).
- **Enhanced + resampled** (`scripts/enhance-4k.mjs`): clarity → Lanczos3 → micro-sharpen → gentle tone. Tiers: `name-4k.jpg` (3840 / 4096 wide), `name.jpg` (desktop), `name-m.jpg` (mobile). srcSets reference all three. `about/portrait.png` → `portrait(-4k|-m).jpg`.
- Note: this is a high-quality resample, not generative AI upscaling — the image service had 0 credits. If you buy credits, `upscale_image` (4K) on the archived originals will add real detail; re-run `retouch.py` on the results first.
- `hero.mp4` and `plates/show-me.mp4` were re-rendered from the cleaned 4K stills (1920×1080, 30fps, 6s, no audio).

## Asset inventory

| Path | Use |
|---|---|
| `/media/hero/hero-still(-4k|-m).jpg` + `hero.mp4` | Hero |
| `/media/plates/show-me(-4k|-m).jpg` + `.mp4` | Show Me chapter |
| `/media/plates/wtda(-4k|-m).jpg` + `.mp4` | WTDA chapter |
| `/media/covers/show-me(-4k|-m).jpg` | Cover + poster merch + tilt card (cross removed; original archived) |
| `/media/covers/wtda(-4k|-m).jpg` | Cover + poster merch + tilt card |
| `/media/about/portrait(-4k|-m).jpg` | About |
| `/media/ash/ash-portrait.jpg` | Widget |
| `/media/merch/*` | Product stills |
| `/audio/previews/*.m4a` | 30s clips |
| `/audio/ash/*.mp3` | Hello / timeout |
| `/prints/*.svg` | Printful print files |
| `/media/og.jpg` | Share card |

### Video plates

| File | Source | Notes |
|---|---|---|
| `/media/hero/hero.mp4` | ffmpeg Ken Burns off `hero-still-4k.jpg` | loops, autoplay |
| `/media/plates/show-me.mp4` | ffmpeg Ken Burns off `show-me-4k.jpg` | **scroll-scrubbed** |
| `/media/plates/wtda.mp4` | ffmpeg Ken Burns off `wtda-4k.jpg` | **scroll-scrubbed** |
| `/media/album/world-of-grey.mp4` | Seedance, boomerang loop | lazy-mounted, desktop only |

The two chapter plates are **scrubbed by scroll**, not played, so they are encoded with
`-g 8` (keyframe every 8 frames). A default GOP makes seeking coarse and slow — if you
re-encode them, keep the small GOP.

Swap any plate: 1920×1080, ~6s, no audio, continuous motion with no cuts (it has to read
correctly scrubbed **backwards** too).

A Seedance take on the WTDA chapter is parked at
`private/masters/seedance/wtda-tightcrop-1080.mp4`. It is unused: the source was portrait
832×1104, and cropping it to 16:9 pushes the newspaper's "Where Dem Dollars At" headline
dead-centre at full size, colliding with the section's own H2 and the cover card — the same
words three times in one viewport. Use it only if a 16:9 re-render frames the headline small
or out of frame.

## Verify

`node scripts/verify-viewports.mjs [desktop|phone]` → `.verify/*.png` (desktop 1440×900 + phone 390×844, every section, ASH open, Listen menu, pinned chapter). Requires the dev server on :3000.

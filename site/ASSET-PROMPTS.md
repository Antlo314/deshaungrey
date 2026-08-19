# MEG Enterprises — asset prompt sheet

Every visual slot on megentllc.com, what to generate (or shoot), the exact spec, and where the
file goes. The site is **complete without any of these** — each slot has a graceful fallback
(gold-dust field, the traced profile mark, "coming soon" tiles). Drop a file in the path and it
appears; nothing else to configure.

**Brand constants for every prompt** — paste this block at the end of each prompt:

> Palette: near-black ink `#050505`, bone `#EDE8DD`, metal gold `#D4B36A` (highlights `#F0DCA6`),
> one signal red `#E4111C` used only as a small accent. Mood: cinematic, editorial, luxury
> record-label, low-key lighting, deep shadow, gold rim light, film grain, no text, no logos,
> no watermarks, no faces unless specified. 4K, photoreal.

Real people (Dr. Glenda S. Williams, Dashaun Grey): **never generate their faces.** Use real
photography only — instructions for those shots are below.

---

## 1. Hero film plate  ★ highest impact

- **Where:** home page hero, plays under the gold-dust canvas, behind the type and the mark.
- **File:** `site/public/media/hero/hero.mp4` (H.264, 1920×1080, 24–30 fps, 8–12 s, seamless loop, **no audio**, ≤ 6 MB — run through HandBrake "Web Optimized" or `ffmpeg -movflags +faststart -crf 26 -g 48`).
- **Poster:** `site/public/media/hero/hero-still.jpg` (1920×1080, one frame of the loop, ≤ 350 KB).
- **Composition rule:** the left 60% must stay dark and quiet (the headline lives there); interest sits right-of-centre. Slow motion only — no cuts, no fast pans. It has to read at 45% opacity under a black-to-transparent gradient.

**Video prompt (pick one, generate 2–3 takes):**

A. *"Slow cinematic drift through a dark recording studio at night: out-of-focus mixing console with tiny amber meter lights, a single condenser microphone in gold rim light on the right third of frame, suspended dust motes catching light, shallow depth of field, camera slides left at a glacial pace, seamless loop, no people, no text."*

B. *"Ultra-slow-motion gold dust and ink drifting in black water, particles rising and catching a single warm light source from the upper right, deep blacks, luxurious, abstract, loopable, no text."*

C. *"Empty theatre stage at night, a single warm spotlight cone through haze from upper right, velvet curtain edge in deep burgundy-black, floating dust, glacial camera push-in, no people, seamless loop."*

## 2. Section texture plates (optional polish)

Used as very dark background washes behind Legacy / Track record / CTA band if you want more depth. Currently plain ink with gold spot gradients — fine to skip.

- **File:** `site/public/media/textures/marble.jpg`, `paper.jpg` (2400×1600, ≤ 400 KB, very dark, ≤ 12% average luminance).
- *"Macro of black marble with fine veins of gold, extremely dark, moody, soft studio light from the left, seamless-tileable texture, no text."*
- *"Black textured cotton paper with faint gold foil speckle, top-down, very low key, seamless texture."*

## 3. Founder portrait — Dr. Glenda S. Williams (REAL PHOTO)

- **Where:** home Legacy section and `/legacy` (sticky frame, 4:5). Currently the gold profile mark stands in.
- **File:** `site/public/media/legacy/founder.jpg` (1600×2000 portrait, ≤ 500 KB). **Drop-in — no code change.** The slot (`components/FounderPortrait.tsx`) shows the mark until this file exists, then fades the photo in.
- **Direction for the shoot / retouch:** dark background (black or charcoal), one warm key light 45° camera-left, gold or bone wardrobe accent, three-quarter or profile pose (the brand mark is a profile — a real profile portrait would be a beautiful echo), unsmiling-to-soft, eyes to camera or just off. Convert to a slightly desaturated warm grade to match the site. No busy backgrounds.

## 4. Roster images (Dashaun Grey — done; future artists)

Dashaun's official portrait and hero still are already copied from his site into
`site/public/media/roster/dashaun-grey.jpg` (4:5) and `dashaun-grey-wide.jpg` (16:9). Nothing to generate.

For each **new** artist added in the dashboard (Roster → Add artist), supply:
- portrait `site/public/media/roster/<slug>.jpg` — 1600×2000, dark background, warm key light, saturation −15%.
- wide `site/public/media/roster/<slug>-wide.jpg` — 2400×1350, subject on the left third, dark right side (the name and buttons overlay bottom-left).

## 5. Release covers

`show-me.jpg` and `wtda.jpg` are in `site/public/media/releases/`. **World Of Grey** has no cover yet and renders as a "coming soon" tile — that is intentional until the real artwork exists. When it does: `site/public/media/releases/world-of-grey.jpg` (3000×3000 square, ≤ 600 KB) and set it in Dashboard → Releases → World Of Grey → Cover.

## 6. Share card (done)

`site/public/media/og.jpg` is generated from the brand system (`node scripts/make-og.mjs`). If you want a photographic one later: 1200×630, left 55% dark for type, the profile mark or a studio image right.

## 7. Icons + brand files (done)

`public/favicon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and the press-kit files in `public/media/brand/` (`logo-full.png`, `logo-profile.png`, `logo-wordmark.png`, `profile.svg`) are all generated by `python scripts/make-logo.py` from the original lockup JPG. If you have the **original vector logo (AI/EPS/SVG)**, drop it in `public/media/brand/` and link it from the press kit list in `app/(site)/press/page.tsx` — a true vector beats the trace.

## 8. Press / news images (optional)

Posts accept an image path. 1600×900, ≤ 300 KB, `site/public/media/press/<slug>.jpg`.
Prompt idea for company posts: *"Editorial still life: vinyl record on black velvet, gold-foil label catching light, extreme shallow focus, moody, no text."*

## 9. Video for the Legacy page (optional, later)

A 20 s ambient loop behind the timeline would be a strong upgrade: *"Archival-feel slow pan across a wall of framed gold and platinum records in a dark hallway, warm picture lights, dust in the air, no readable text, seamless loop."* Same specs as the hero plate. File `site/public/media/legacy/legacy.mp4` — needs a two-line wiring in `app/(site)/legacy/page.tsx` (see OPUS-HANDOFF.md).

---

### Delivery checklist
1. Export at spec, name exactly as above, drop into `site/public/media/...`.
2. `npm run dev` → check the page. Video: watch it loop once at 45% opacity — if the left side is busy, darken it (`ffmpeg -vf "curves=all='0/0 0.5/0.35 1/1'"`).
3. Commit + push → Vercel redeploys.

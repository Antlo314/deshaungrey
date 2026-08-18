# Dashaun Grey — World of Grey

Next.js 16 artist site. Cinematic one-pager: preloader, Lenis smooth scroll, custom cursor, scroll-scrubbed chapters, Web-Audio visualizer, persistent mini-player, album teaser, About, MEG Enterprises label section, merch, tour list, ASH voice widget. Previews play. Stripe and Printful are stubbed. ASH greets.

Streaming + social links are placeholders in `lib/catalog.ts` (`dsps`, `socials`) — fill them in before launch.

```
cd C:\Users\aarons\Desktop\DashawnGrey\site
copy .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

Keys live in `.env.local` (never commit). Copy the ElevenLabs key from `LUMENCOMMAND\Zion\data\secrets.json` → `elevenLabsApiKey`. Create the agent with the prompts in `VOICE.md`.

See `FABLE-HANDOFF.md` before a visual pass.

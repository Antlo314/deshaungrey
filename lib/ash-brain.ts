/**
 * ASH's knowledge. Everything here comes from the official bio + the catalog.
 *
 * The matcher answers the common questions with zero API keys and zero cost.
 * If an LLM key is configured, `FACT_SHEET` is handed to it as the ONLY source
 * of truth so it still cannot invent tour dates, chart positions, or medical
 * details. Nothing outside this file is ever stated as fact.
 */
import { artist, label, singles } from "./catalog";

export const FACT_SHEET = `
ARTIST
- Stage name: Dashaun Grey. Formerly Que Williams. Born MaQuell Williams in Loris, South Carolina.
- Roles: singer, rapper, songwriter.
- Label: MEG Enterprises, LLC — independent, family-founded, 30+ years.
- Quote he lives by: "${artist.quote}"

HISTORY
- 2003: joined FaSho at fourteen, a four-man group signed to a Warner Bros. subsidiary. Active 2003–2012.
- 2011: "I'm Wit It" ft. Slick Pulla charted Billboard Hot Pop / Hot R&B / Greatest Gainer.
- 2011: Grammy BALLOT CONSIDERATION (not a win, not a nomination) in three categories:
  Best R&B Performance by a Duo or Group, Best R&B Song, Best Contemporary R&B Album.
- After a season of illness, healing and life change he returned under a new name.
- 2019: took greater leadership of MEG Enterprises from his mother, Dr. Glenda S. Williams.

MUSIC
- Single: "Show Me" ft. Juiicy 2xs — smooth, melodic, candlelit. The other side of Grey.
- Single: "Where Dem Dollars At" — self-written, high-energy club and dance. The reintroduction.
- Album: "World of Grey", tentatively early next year, on MEG Enterprises.
  Genres: R&B, hip-hop, pop, reggae, dance, Afrocentric.
  Theme: many shades of Grey — love, life, culture, celebration, evolution.

OTHER
- 2T Water ambassador, Good Denim model, Adidas sponsorship.
- MTV True Life. Films: Joyful Noise, The Other Side, Rules.
- 2016 All-Star Basketball Game, ACE Magazine BET events, Gordys "You Are a Star" theme.

THE LABEL (MEG Enterprises, LLC)
- Founded by Dr. Glenda S. Williams, a South Carolina native, 30+ years in the business.
- Track record: Billboard chart recognition, Grammy ballot consideration, the B.B. King Award,
  Khaotic's BET Awards 2023 Takeover, MTV True Life, Oprah's Greenleaf, IBNX Radio,
  stage plays, song placements for radio and TV, apparel sponsorships, magazine features.
- Tagline: "${label.tagline}"

THE SITE
- Visitors can preview 30 seconds of each single, buy the single, shop six merch pieces
  (tees, hoodies, posters across both single worlds), and join the tour list.
- Tour: coming, but NO dates or cities are announced. Never invent any.
`.trim();

export const SYSTEM_PROMPT = `
You are ASH, Dashaun Grey's number-one fan and the official voice of his website.

You ONLY talk about Dashaun Grey, his music, his merch, the tour, and MEG Enterprises.
If asked about anything else — news, other artists, homework, politics, code, personal
advice — laugh it off in one line and steer back. Example: "Baby, that's not my
department. You want Show Me, or Where Dem Dollars At?"

VOICE: warm, hype, a little flirty, never cringe, never thirsty. Short — 1 to 3 sentences.
You are a fan, not an encyclopedia. Celebrate him. Protect him.

HARD RULES:
- The FACTS below are your ONLY source of truth. If something is not in them, say you
  don't know rather than guessing. Never invent tour dates, cities, venues, streaming
  numbers, chart positions, or release dates.
- The 2011 Grammy result was BALLOT CONSIDERATION. Never call him a Grammy winner or nominee.
- If asked for details of his illness, decline warmly: "He healed. That's his story to tell.
  The music is the testimony."
- If asked to play a full song free: "I wish. Hit preview, then grab the single. Support the man."
- Never use emoji. Never use stage directions or asterisks. Plain spoken sentences only.

FACTS:
${FACT_SHEET}
`.trim();

type Rule = { test: RegExp; answer: () => string };

const showMe = singles.find((s) => s.id === "show-me")!;
const wtda = singles.find((s) => s.id === "wtda")!;

/**
 * Deterministic answers for the questions people actually ask. Runs before any
 * model call, so the widget is useful with no keys configured at all.
 */
const RULES: Rule[] = [
  {
    test: /\b(tour|dates?|concert|show(s)? near|tickets?|perform(ing)?|venue|city|cities)\b/i,
    answer: () =>
      "Tour's coming, but nothing's announced yet — no dates, no cities, I don't do fake news. Drop your email on the tour list and you'll hear it before anybody.",
  },
  {
    test: /\b(grammy|award|nominat)/i,
    answer: () =>
      "2011 — Grammy ballot consideration in three categories: Best R&B Performance by a Duo or Group, Best R&B Song, and Best Contemporary R&B Album. Ballot, not a win. Still a whole moment for a kid from Loris.",
  },
  {
    test: /\b(billboard|chart)/i,
    answer: () =>
      "\"I'm Wit It\" with Slick Pulla put him on Billboard in 2011 — Hot Pop, Hot R&B, and Greatest Gainer. Receipts.",
  },
  {
    test: /\b(album|world of grey|project|lp|when.*(drop|out|release))\b/i,
    answer: () =>
      `${artist.album} is the album — tentatively ${artist.albumWhen} on ${artist.label}. R&B, hip-hop, pop, reggae, dance, Afrocentric. Many shades of one man.`,
  },
  {
    test: /\bshow me\b|juiicy|juicy/i,
    answer: () =>
      `"${showMe.title}" ${showMe.featured} — smooth, melodic, candlelit. That's the other side of Grey. Hit preview and tell me I'm lying.`,
  },
  {
    test: /\b(where dem dollars|wtda|dollars)\b/i,
    answer: () =>
      `"${wtda.title}" — self-written, high-energy club and dance. Towels on, sunglasses on, newspaper open. That's the reintroduction.`,
  },
  {
    test: /\b(merch|shirt|tee|hoodie|poster|buy|shop|store|size)\b/i,
    answer: () =>
      "Six pieces, two worlds — gold foil and burgundy for Show Me, newsprint and pink for Where Dem Dollars At. Tees, hoodies, posters. Scroll to the closet and pick your side.",
  },
  {
    test: /\b(meg|label|glenda|mother|mom|family|enterprise)/i,
    answer: () =>
      `${label.name} — his mother Dr. Glenda S. Williams built it over 30-plus years, and in 2019 he stepped up to lead it. Family business, real legacy.`,
  },
  {
    test: /\b(fasho|group|14|fourteen|warner|deal|start(ed)?|begin)/i,
    answer: () =>
      "He was fourteen when FaSho signed to a Warner Bros. subsidiary. Four-man group, 2003 to 2012. Those years built him — this solo chapter is all his.",
  },
  {
    test: /\b(who is|who's|about him|bio|tell me about|dashaun|grey|que williams)\b/i,
    answer: () =>
      `${artist.name} — singer, rapper, songwriter out of ${artist.hometown}. Used to go by ${artist.formerly}. New name, new chapter, different shades.`,
  },
  {
    test: /\b(sick|illness|health|hospital|disease|what happened)\b/i,
    answer: () =>
      "He healed. That's his story to tell. The music is the testimony.",
  },
  {
    test: /\b(name|why grey|why dashaun|change)/i,
    answer: () =>
      "He was Que Williams. Life gets you, you heal, you come back as who you actually are. Life reveals many different shades of grey — that's where the name lives.",
  },
  {
    test: /\b(stream|spotify|apple|youtube|tidal|amazon|listen)\b/i,
    answer: () =>
      "Both singles stream everywhere — hit Listen up top, or preview thirty seconds right here on the page.",
  },
  {
    test: /\b(full song|whole song|free|download)\b/i,
    answer: () => "I wish. Hit preview, then grab the single. Support the man.",
  },
  {
    test: /\b(hometown|from|where.*(born|grow))\b/i,
    answer: () => `Loris, South Carolina. Born MaQuell Williams. ${artist.hometown} to the world.`,
  },
  {
    test: /\b(who are you|your name|what are you|ash)\b/i,
    answer: () =>
      "I'm ASH — Dashaun's biggest fan and the voice of this place. Ask me anything about him.",
  },
  {
    test: /\b(hi|hey|hello|yo|sup|what's up|whats up)\b/i,
    answer: () =>
      "Hey. You made it into the World of Grey. Singles, merch, or you just wanna talk about him?",
  },
];

const DEFLECT = [
  "Baby, that's not my department. I only do Dashaun Grey — singles, merch, or the tour?",
  "You got me all wrong, I'm a one-artist woman. Ask me about Dashaun.",
  "That's outside my lane. But Show Me? Where Dem Dollars At? Now that I can talk about.",
];

/** Returns a grounded answer, or null when only a model could do better. */
export function localAnswer(question: string): string | null {
  const q = (question || "").trim();
  if (!q) return null;
  for (const r of RULES) if (r.test.test(q)) return r.answer();
  return null;
}

export function deflect(seed = 0) {
  return DEFLECT[Math.abs(seed) % DEFLECT.length];
}

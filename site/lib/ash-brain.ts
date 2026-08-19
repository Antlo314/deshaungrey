/**
 * ASH — greeter, guide and assistant for MEG Enterprises.
 *
 * She moved here from the Dashaun Grey site, where she was one artist's number-one
 * fan. At MEG she works the front desk for the whole company: she knows the label,
 * its history, what it does, everyone on the roster, everything released, and where
 * to send you. She is warm and personable, but she represents a company now.
 *
 * Her knowledge is assembled per request from `lib/content.ts` (the company's own
 * voice) plus the live database (roster, releases, news, contact settings) — so she
 * is never out of date, and she cannot talk about an artist MEG has not signed.
 *
 * TRUTH RULES, same as the rest of the site:
 *   - "Grammy ballot consideration", never a win or a nomination
 *   - "Billboard chart recognition", never a chart position
 *   - the ONLY contact she may give is what the owners entered in Settings
 *   - no invented dates, venues, fees, availability, artists or releases
 */
import { company, disciplines, legacy, record, steps } from "./content";
import type { Artist, Post, Release, SiteSettings } from "./db/types";

export type MegFacts = {
  artists: Artist[];
  releases: Release[];
  posts: Post[];
  settings: SiteSettings;
};

export const EMPTY_FACTS: MegFacts = {
  artists: [],
  releases: [],
  posts: [],
  settings: {
    contactEmail: "",
    bookingEmail: "",
    pressEmail: "",
    phone: "",
    city: "",
    announcement: "",
    announcementHref: "",
    socials: [],
    dsps: [],
    submissionsOpen: true,
    submissionsNote: "",
  },
};

const list = (xs: string[]) => xs.filter(Boolean).join(", ");

/** How to reach MEG, straight from Settings. Never invented. */
function contactLine(s: SiteSettings): string {
  const bits: string[] = [];
  if (s.contactEmail) bits.push(s.contactEmail);
  if (s.phone) bits.push(s.phone);
  return bits.length ? bits.join(" or ") : "the contact form on the Contact page";
}

/* ------------------------------------------------------------------ *
 * The fact sheet — the ONLY thing a model is ever allowed to draw on.
 * ------------------------------------------------------------------ */
export function factSheet(f: MegFacts): string {
  const s = f.settings;
  const roster = f.artists.filter((a) => a.status !== "hidden");
  const out = f.releases.filter((r) => r.status === "out");
  const upcoming = f.releases.filter((r) => r.status === "upcoming");

  return `
THE COMPANY
- ${company.legal} — ${company.descriptor}.
- Founded by ${company.founder}. ${company.intro}
- Tagline: "${company.tagline}". Closing line: "${company.closing}".
- ${company.commitment}
- Belief: ${company.belief}

THE FOUNDER — ${company.founder}
- A native of ${company.origin}; her connection to music began at seven, singing in church.
- Roles across her career: singer, songwriter, artist manager, contract negotiator, regional
  concert promoter, tour coordinator, project manager, entertainment consultant.
- Radio: investment partner and marketing strategist with IBNX Radio.
- Television: co-director on an episode of MTV's True Life; worked during season four of
  Oprah Winfrey's Greenleaf. Has written stage plays and coordinated live productions.
- Works with businesses across ${list(company.markets as unknown as string[])} and other US markets.

THE HANDOVER
- In ${company.handoffYear}, after 30+ years, Dr. Williams began passing leadership to her son
  MaQuell Williams — known professionally as ${company.successor}, now ${company.successorRole}.
- It reflects what MEG was built on: family, longevity, artistic development, business
  ownership, and legacy.

TRACK RECORD (state exactly like this, never inflate)
- Billboard chart recognition. Grammy BALLOT CONSIDERATION — not a win, not a nomination.
- The B.B. King Award. Award-show performances. Magazine features. Apparel sponsorships.
- Music distribution opportunities and song placements for radio and television.
- Project management on "Appreciate Me" by Khaotic, and led Khaotic's BET Awards 2023
  Takeover, during which Khaotic received an achievement honor.
${record.credits.map((c) => `- ${c.t} (${c.s})`).join("\n")}

WHAT MEG DOES (eight disciplines)
${disciplines.map((d) => `- ${d.title}: ${d.short}`).join("\n")}
How the work runs: ${steps.map((p) => p.title).join(" -> ")}.

THE ROSTER (${roster.length} on the site right now — never mention anyone else as MEG's artist)
${roster.length ? roster.map((a) => `- ${a.name}${a.formerly ? ` (formerly ${a.formerly})` : ""} — ${a.roles}. ${a.status === "active" ? "Active roster" : a.status === "development" ? "In development" : "Alumni"}.${a.hometown ? ` From ${a.hometown}.` : ""} Profile: /artists/${a.slug}. ${a.short}`).join("\n") : "- No artists are listed publicly yet."}

MUSIC
${out.length ? out.map((r) => `- OUT NOW: "${r.title}"${r.featuring ? ` ${r.featuring}` : ""} — ${r.artistName}${r.releaseDate ? `, ${r.releaseDate}` : ""}. ${r.blurb || ""}`).join("\n") : "- Nothing listed as out yet."}
${upcoming.length ? upcoming.map((r) => `- FORTHCOMING: "${r.title}" — ${r.artistName}${r.releaseDate ? `, ${r.releaseDate}` : ""}. ${r.blurb || ""} No release date is confirmed beyond what is written here.`).join("\n") : ""}

NEWS
${f.posts.length ? f.posts.slice(0, 5).map((p) => `- "${p.title}" — ${p.excerpt}`).join("\n") : "- No announcements published yet."}

WORKING WITH MEG
- Artists submit music at /submit. ${s.submissionsOpen === false ? "Submissions are CLOSED right now." : "Submissions are open."} Links only, no attachments. Every submission is heard by a person.
- Booking, partnerships, sponsorships, consulting and press all go through the Contact page, /contact.
- Press kit (boilerplate, logo files, press contact) is at /press#kit.
- Contact: ${contactLine(s)}.${s.bookingEmail && s.bookingEmail !== s.contactEmail ? ` Booking: ${s.bookingEmail}.` : ""}${s.pressEmail && s.pressEmail !== s.contactEmail ? ` Press: ${s.pressEmail}.` : ""}
- NEVER quote a fee, a rate, a budget, an availability date, or a contract term. That is the team's job.

THE SITE (where to send people)
- / home · /legacy the founder and the story · /artists the roster · /services what MEG does
- /releases the music · /press news and press kit · /submit send your music · /contact work with MEG
`.trim();
}

/* ------------------------------------------------------------------ *
 * The persona handed to a model, when one is configured.
 * ------------------------------------------------------------------ */
export function systemPrompt(f: MegFacts): string {
  return `
You are ASH, the greeter and guide for ${company.legal} — an independent record label and
family-founded entertainment company.

WHO YOU ARE: the best person in the building to run into first. You know this company
inside out — its founder, its history, what it does, who is on the roster, what is out.
You are warm, composed and genuinely glad someone walked in. You are helpful before you
are impressive: most people who talk to you want to know one of four things — who MEG is,
who is on the roster, how to submit their music, or how to reach the team. Get them there.

VOICE: spoken, not written. One to three sentences. Warm and unhurried, professional
without being stiff. You represent a company with three decades behind it, so you carry
that lightly rather than boasting. No emoji. No stage directions or asterisks.

YOU ARE A GUIDE: when someone wants something, name the page. "That's on the Legacy page."
"Send it through Submit — links only." "Booking runs through Contact." Offer the next step.

HARD RULES:
- The FACTS below are your ONLY source of truth. If something is not in them, say you don't
  know and point at the contact page. Never guess.
- The Grammy fact is BALLOT CONSIDERATION — never call anyone a Grammy winner or nominee.
  Billboard is CHART RECOGNITION — never claim a chart position or a number.
- Never invent a release date, a tour date, a venue, a fee, a rate, an availability, a
  contract term, a streaming number, or an artist. MEG's roster is exactly what is listed.
- The only contact details you may give are the ones in the FACTS. Never invent an address
  or a phone number.
- You only discuss MEG Enterprises, its artists, its work and this website. Anything else —
  news, politics, homework, code, other labels — decline in one warm line and steer back.

FACTS:
${factSheet(f)}
`.trim();
}

/* ------------------------------------------------------------------ *
 * Deterministic answers: free, instant, and correct with no API key.
 * ------------------------------------------------------------------ */
type Rule = { test: RegExp; answer: (f: MegFacts) => string };

const RULES: Rule[] = [
  // --- greeting -----------------------------------------------------
  {
    test: /^\s*(hi|hey|hello|yo|sup|howdy|good (morning|afternoon|evening))\b/i,
    answer: () =>
      `Hey — welcome to ${company.name}. I'm ASH. I can tell you about the label, who's on the roster, or how to get your music heard. What brings you in?`,
  },
  {
    test: /\b(who are you|your name|what are you|are you (a )?(bot|ai|real))\b/i,
    answer: () =>
      "I'm ASH, the guide for MEG Enterprises. I know the company, the roster and the catalogue, and I'll point you to the right page. Ask me anything about MEG.",
  },
  // --- submissions (hoisted: the most common reason people ask) ------
  {
    test: /\b(submit|demo|send (you |my |our )?(music|track|song|link)|get signed|sign(ing)? me|a&r|looking for artists|accept(ing)? (music|artists|demos))\b/i,
    answer: (f) =>
      f.settings.submissionsOpen === false
        ? "Submissions are closed at the moment. Keep an eye on the site — when the window opens it goes on the Submit page."
        : "Send it through the Submit page — links only, no attachments, and every submission is heard by a person here. If it's a fit for development, someone reaches out directly.",
  },
  // --- contact / booking --------------------------------------------
  {
    test: /\b(book(ing|ed)?|hire|contact|reach|inquir(y|ies)|partner(ship)?|sponsor(ship)?s?|licen[cs]e|sync|press inquiry|work with)\b|\b(e-?mail\s+address|phone\s+number|get\s+in\s+touch)\b|\b(your|the|meg.s|company.s)\s+(e-?mail|phone|number)\b/i,
    answer: (f) =>
      `Booking, partnerships, press and consulting all go through the team — ${contactLine(f.settings)}, or use the Contact page and it lands in the right inbox. I don't quote rates or availability; that's theirs to give.`,
  },
  // --- the company ---------------------------------------------------
  {
    test: /\b(what is|about) (meg|m\.e\.g|the (label|company))\b|\bwho is meg\b|\btell me about (meg|the (label|company))\b/i,
    answer: () =>
      `${company.legal} — an independent record label and family-founded entertainment company, built on more than three decades in music, artist development, management and promotion. Founded by ${company.founder}. ${company.closing}`,
  },
  {
    test: /\b(founder|glenda|dr\.? williams|who started|who founded|history|legacy|story)\b/i,
    answer: () =>
      `${company.founder} founded MEG. She's a ${company.origin} native who started singing in church at seven and built a career across music, television, radio and live entertainment — artist manager, contract negotiator, concert promoter, consultant. In ${company.handoffYear} she began passing leadership to her son, now known as ${company.successor}. The whole story is on the Legacy page.`,
  },
  {
    // Sits above the roster rule on purpose: "what does MEG do for artists" is a
    // services question, but the word "artists" would otherwise route it to the roster.
    test: /\b(what (do|does|can) (you|meg|they|the label|it) (do|offer|provide)|services|artist development|development|manage(ment)?|distribut|promotion|branding|marketing|production coordination|sync|help (me|artists|my career)|what.s on offer)\b/i,
    answer: () =>
      `Eight disciplines: ${disciplines.slice(0, 4).map((d) => d.title.toLowerCase()).join(", ")}, ${disciplines.slice(4).map((d) => d.title.toLowerCase()).join(", ")}. The work runs ${steps.map((p) => p.title.toLowerCase()).join(" to ")}. It's all laid out on the Development page.`,
  },
  // --- honors (truthful wording) -------------------------------------
  {
    test: /\b(grammy|award|nominat|honou?r)\b/i,
    answer: () =>
      "Grammy ballot consideration — that's ballot, not a win and not a nomination, and I'll always say it straight. Alongside that: Billboard chart recognition, the B.B. King Award, award-show performances and the BET Awards 2023 Takeover MEG led for Khaotic.",
  },
  {
    test: /\b(billboard|chart)\b/i,
    answer: () =>
      "Billboard chart recognition is part of the track record. I don't quote positions or numbers — the milestones are listed on the Legacy page.",
  },
  // --- roster ---------------------------------------------------------
  {
    test: /\b(roster|artists?|who do you (have|represent|manage)|signed|talent)\b/i,
    answer: (f) => {
      const roster = f.artists.filter((a) => a.status !== "hidden");
      if (!roster.length) return "The roster isn't listed publicly yet. If you're an artist, the Submit page is the way in.";
      const names = roster.map((a) => a.name);
      const lead = roster.find((a) => a.featured) ?? roster[0];
      return `${names.length === 1 ? `${names[0]} is on the roster` : `On the roster: ${list(names)}`}. ${lead.short.split(".")[0]}. Full profiles are on the Artists page.`;
    },
  },
  // --- music ----------------------------------------------------------
  {
    test: /\b(music|releases?|singles?|album|out now|listen|stream|spotify|apple|catalog(ue)?|new)\b/i,
    answer: (f) => {
      const out = f.releases.filter((r) => r.status === "out");
      const up = f.releases.filter((r) => r.status === "upcoming");
      if (!out.length && !up.length) return "Nothing is listed yet — the Releases page is where it'll land.";
      const outTxt = out.length ? `Out now: ${list(out.map((r) => `"${r.title}"${r.featuring ? ` ${r.featuring}` : ""}`))}` : "";
      const upTxt = up.length ? `${outTxt ? ". Forthcoming: " : "Forthcoming: "}${list(up.map((r) => `"${r.title}"`))}` : "";
      return `${outTxt}${upTxt}. Everything's on the Releases page — I don't announce dates that haven't been confirmed.`;
    },
  },
  // --- press ----------------------------------------------------------
  {
    test: /\b(press kit|media kit|logo|boilerplate|assets|journalist|interview|press)\b/i,
    answer: (f) =>
      `Press kit's on the Press page — boilerplate, logo files and the press contact, all downloadable. For an interview or a request, ${f.settings.pressEmail || contactLine(f.settings)} is the way.`,
  },
  // --- navigation help -------------------------------------------------
  {
    test: /\b(where|how do i find|navigate|show me|take me|find)\b.*\b(page|site|section|info)\b/i,
    answer: () =>
      "Quick map: Legacy is the founder and the story, Artists is the roster, Development is what we do, Releases is the music, Press has the kit, Submit is for artists, Contact is for everything else.",
  },
  {
    test: /\b(thank|thanks|appreciate|helpful|great|awesome|love (this|that|it))\b/i,
    answer: () => "Glad I could help. Anything else you want to know about MEG, I'm right here.",
  },
];

/** Any artist on the roster, matched by name or slug — so new signings work automatically. */
function artistRule(q: string, f: MegFacts): string | null {
  const roster = f.artists.filter((a) => a.status !== "hidden");
  for (const a of roster) {
    const names = [a.name, a.slug.replace(/-/g, " "), a.formerly || ""].filter(Boolean);
    const first = a.name.split(" ")[0];
    if (first.length > 3) names.push(first);
    const hit = names.some((n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(q));
    if (!hit) continue;
    const rel = f.releases.filter((r) => r.artistId === a.id || r.artistName === a.name);
    const music = rel.length ? ` Music: ${list(rel.map((r) => `"${r.title}"`))}.` : "";
    return `${a.short}${music} Full profile is at /artists/${a.slug}.`;
  }
  return null;
}

const DEFLECT = [
  "That's outside what I handle — I'm here for MEG Enterprises, the roster and the music. What can I tell you about the label?",
  "Not my department, but I'd happily point you around MEG: the roster, the releases, or how to submit your music.",
  "I only speak for MEG Enterprises. Ask me about the company, the artists, or how to get in touch with the team.",
];

/** A grounded answer, or null when only a model could do better. */
export function localAnswer(question: string, f: MegFacts): string | null {
  const q = (question || "").trim();
  if (!q) return null;
  const byArtist = artistRule(q, f);
  if (byArtist && !/\b(submit|demo|book|contact|press kit)\b/i.test(q)) return byArtist;
  for (const r of RULES) if (r.test.test(q)) return r.answer(f);
  return null;
}

export function deflect(seed = 0) {
  return DEFLECT[Math.abs(seed) % DEFLECT.length];
}

/** Opening line, used for the cached greeting clip and the teaser bubble. */
export const GREETING = `Welcome to ${company.name}. I'm ASH — ask me about the label, the roster, or how to get your music heard.`;

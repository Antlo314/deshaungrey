/**
 * MEG Enterprises — static company copy.
 *
 * Everything here is sourced from the company bio (`../meg.txt`) and the
 * Dashaun Grey artist bio. Wording is deliberately truthful:
 * "Grammy ballot consideration", not a win; "Billboard chart recognition",
 * not a number one. Do not inflate. Roster, releases, press and settings that
 * the owners can edit live in the database (see lib/db) — this file is the
 * voice of the company, not the catalogue.
 */

export const company = {
  legal: "MEG Enterprises, LLC",
  name: "MEG Enterprises",
  short: "M.E.G",
  descriptor: "Independent Record Label · Music · Artist Development · Management · Entertainment",
  tagline: "Independent Music. Developing Artists. Building Brands. Creating Legacy.",
  closing: "More Than Music. Building Legacy.",
  founder: "Dr. Glenda S. Williams",
  founderRole: "Founder · Chief Executive",
  successor: "Dashaun Grey",
  successorLegal: "MaQuell Williams",
  successorRole: "President · Artist",
  handoffYear: "2019",
  years: "30+",
  yearsLabel: "years in music, artist development, management, promotion and entertainment business strategy",
  markets: ["Georgia", "South Carolina", "North Carolina", "Florida", "California"],
  origin: "South Carolina",
  intro:
    "MEG Enterprises, LLC is an independent record label and family-founded entertainment company built on more than three decades of experience in music, artist development, management, promotion, and entertainment business strategy. Founded by Dr. Glenda S. Williams, MEG Enterprises has established a history of developing talent, creating opportunities, and strategically positioning artists and entertainment projects for growth.",
  commitment:
    "As an independent label, MEG Enterprises is committed to providing artists with an environment that supports creative development, professional growth, strategic release planning, branding, promotion, and long-term career development while maintaining an entrepreneurial approach to the business of music.",
  belief:
    "Successful artist development requires more than recording great music. It requires vision, preparation, business strategy, creative development, proper positioning, and a team committed to the artist's long-term growth.",
  today:
    "With decades of experience behind it and a new generation of music ahead, MEG Enterprises remains committed to developing artists, releasing music independently, creating meaningful entertainment, building strategic partnerships, and transforming artistic vision into lasting legacy.",
  newEra:
    "Today, MEG Enterprises continues building upon that foundation while entering a new era as an independent label. The company is developing and positioning new music while expanding its relationships across radio, digital distribution, promotion, media, and the broader entertainment industry.",
};

/** The eight things the label actually does — grouped from the bio's own list. */
export const disciplines = [
  {
    n: "01",
    slug: "artist-development",
    title: "Artist Development",
    short: "Vision, preparation and positioning before the first release.",
    body:
      "Development starts before the studio. We work with an artist on identity, sound, performance and readiness — building the foundation a career is meant to stand on, not a single that has to carry everything.",
    tags: ["Identity", "Sound", "Performance", "Readiness"],
    icon: "seed",
  },
  {
    n: "02",
    slug: "management",
    title: "Management",
    short: "Day-to-day representation and long-term career strategy.",
    body:
      "Contract negotiation, scheduling, team-building and decisions made with the artist's next five years in view — the same management discipline the company was founded on.",
    tags: ["Representation", "Negotiation", "Career strategy"],
    icon: "compass",
  },
  {
    n: "03",
    slug: "release-strategy",
    title: "Release Strategy & Distribution",
    short: "Strategic release planning and digital distribution.",
    body:
      "Every release is a campaign: timing, sequencing, digital distribution, metadata, pre-save and rollout — coordinated so the music lands with intention.",
    tags: ["Release planning", "Digital distribution", "Rollout"],
    icon: "orbit",
  },
  {
    n: "04",
    slug: "branding",
    title: "Branding & Marketing",
    short: "Brand identity, visual world and marketing strategy.",
    body:
      "A record has a world around it. We build the artist's brand — visual identity, story, merchandise and marketing strategy — so audiences meet the whole picture, not just a track.",
    tags: ["Brand identity", "Creative direction", "Marketing"],
    icon: "prism",
  },
  {
    n: "05",
    slug: "promotion",
    title: "Promotion & Radio",
    short: "Promotional planning and radio relationships.",
    body:
      "Promotional planning across radio, digital and media, drawing on relationships that go back to the founder's years as a regional concert promoter and radio investment partner.",
    tags: ["Radio", "Digital promotion", "Media"],
    icon: "signal",
  },
  {
    n: "06",
    slug: "production",
    title: "Production Coordination",
    short: "Music production coordination and project management.",
    body:
      "Studio schedules, collaborators, budgets, deliverables and deadlines — project-managed from first session to final master, the way MEG has managed productions for three decades.",
    tags: ["Project management", "Studio", "Deliverables"],
    icon: "console",
  },
  {
    n: "07",
    slug: "sync",
    title: "Sync & Placements",
    short: "Song placements for radio and television.",
    body:
      "Positioning records for placement opportunities across radio and television, informed by the founder's own work in television and film production.",
    tags: ["Radio", "Television", "Placements"],
    icon: "screen",
  },
  {
    n: "08",
    slug: "consulting",
    title: "Industry Relations & Consulting",
    short: "Strategic industry relationships and entertainment consulting.",
    body:
      "Entertainment business strategy, partnerships and consulting for artists, projects and businesses — the practice Dr. Williams has run across Georgia, the Carolinas, Florida, California and beyond.",
    tags: ["Partnerships", "Consulting", "Strategy"],
    icon: "handshake",
  },
] as const;

/** How the work runs. Five verbs, from the bio's own language. */
export const steps = [
  { n: "01", title: "Discover", body: "Listen first. Where the artist is, what the record is, what the next chapter should be." },
  { n: "02", title: "Develop", body: "Creative development, preparation and business strategy — the vision, made ready." },
  { n: "03", title: "Position", body: "Brand, story and proper positioning so the release lands in the right room." },
  { n: "04", title: "Release", body: "Strategic release planning, distribution, promotion and placement, run as a campaign." },
  { n: "05", title: "Grow", body: "Long-term career development. A team committed to the artist's growth, not one single." },
];

/** Track record — from the bio, verbatim in spirit. */
export const record = {
  headline: [
    { big: "30+", label: "Years", detail: "in music, artist development, management, promotion and entertainment business strategy." },
    { big: "Billboard", label: "Chart recognition", detail: "Career and project milestones under Dr. Williams' leadership include Billboard chart recognition." },
    { big: "Grammy", label: "Ballot consideration", detail: "Grammy ballot consideration among the milestones the company has contributed to." },
    { big: "B.B. King", label: "Award", detail: "The B.B. King Award, award-show performances, magazine features and apparel sponsorships." },
  ],
  credits: [
    { t: "Billboard chart recognition", s: "Milestone" },
    { t: "Grammy ballot consideration", s: "Milestone" },
    { t: "The B.B. King Award", s: "Honor" },
    { t: "Award-show performances", s: "Live" },
    { t: "Khaotic — “Appreciate Me” project management", s: "Collaboration" },
    { t: "Khaotic's BET Awards 2023 Takeover — achievement honor", s: "Project lead" },
    { t: "MTV True Life — episode co-direction", s: "Television" },
    { t: "Greenleaf, season four (OWN)", s: "Television" },
    { t: "IBNX Radio — investment partner & marketing strategist", s: "Radio" },
    { t: "Song placements for radio and television", s: "Sync" },
    { t: "Music distribution opportunities", s: "Distribution" },
    { t: "Apparel sponsorships · magazine features", s: "Brand" },
    { t: "Stage plays · dance & entertainment productions", s: "Stage" },
  ],
  /** Text wordmarks for the hero strip. Text only — no third-party logos. */
  strip: ["Billboard", "Grammy Ballot", "BET Awards", "MTV", "OWN", "IBNX Radio", "B.B. King Award"],
};

/** Founder story, sequenced. Years only where the bio gives them. */
export const legacy = {
  title: "A Legacy Built in Music",
  quote: "Family, longevity, artistic development, business ownership, and legacy.",
  paragraphs: [
    "A native of South Carolina, Dr. Williams' connection to music began at the age of seven, singing in church and progressing through various choir levels. What began as a childhood passion eventually developed into a multifaceted career spanning music, television, radio, live entertainment, and business.",
    "Throughout her career, Dr. Williams has served in numerous capacities, including singer, songwriter, artist manager, contract negotiator, regional concert promoter, tour coordinator, project manager, and entertainment consultant. Her combination of business leadership and entertainment experience became the foundation upon which MEG Enterprises was built.",
    "Her experience expanded into radio as an investment partner and marketing strategist with IBNX Radio. Her television experience has included serving as a co-director for an episode of MTV's True Life: I'm in a Long Distance Relationship and working part-time during the fourth season of Oprah Winfrey's television series Greenleaf. She has also written stage plays and coordinated dance and entertainment productions in various markets across the country.",
    "Beyond entertainment, Dr. Williams has developed a reputation as a project manager, solutions provider, consultant, and business strategist, working with businesses and professionals throughout Georgia, South Carolina, North Carolina, Florida, California, and other markets across the United States.",
  ],
  nextGen: {
    title: "The Next Generation",
    body:
      "After more than 30 years in the entertainment industry, Dr. Williams began transitioning the company's legacy to the next generation in 2019, passing greater leadership responsibility to her son, MaQuell Williams, professionally known today as Dashaun Grey. The evolution represents more than a change in leadership — it reflects the foundation upon which MEG Enterprises was created: family, longevity, artistic development, business ownership, and legacy.",
  },
  timeline: [
    { when: "Age 7", sub: "South Carolina", what: "Singing in church, progressing through choir levels. A childhood passion becomes a career.", now: false },
    { when: "The work", sub: "Music & live", what: "Singer, songwriter, artist manager, contract negotiator, regional concert promoter, tour coordinator, project manager, entertainment consultant.", now: false },
    { when: "Radio", sub: "IBNX Radio", what: "Investment partner and marketing strategist.", now: false },
    { when: "Screen", sub: "MTV · OWN", what: "Co-director on an episode of MTV's True Life; part of the fourth season of Oprah Winfrey's Greenleaf. Stage plays and productions in markets across the country.", now: false },
    { when: "MEG", sub: "Independent", what: "MEG Enterprises, LLC — an independent record label and family-founded entertainment company. Billboard recognition, Grammy ballot consideration, the B.B. King Award, radio and television placements.", now: false },
    { when: "2019", sub: "Next generation", what: "Leadership passes to Dr. Williams' son, MaQuell Williams — known today as Dashaun Grey.", now: false },
    { when: "2023", sub: "BET Awards", what: "MEG leads Khaotic's BET Awards 2023 Takeover, during which Khaotic received an achievement honor.", now: false },
    { when: "Now", sub: "A new era", what: "The reintroduction of Dashaun Grey — “Where Dem Dollars At” and “Show Me” ft. Juiicy 2xs — leading toward his forthcoming solo project, World Of Grey.", now: true },
  ],
};

export const nav = [
  { href: "/legacy", label: "The Legacy", sub: "Founder & story" },
  { href: "/artists", label: "Artists", sub: "The roster" },
  { href: "/services", label: "Development", sub: "What we do" },
  { href: "/releases", label: "Releases", sub: "Music" },
  { href: "/press", label: "Press", sub: "News & press kit" },
  { href: "/contact", label: "Contact", sub: "Work with MEG" },
] as const;

export const inquiryKinds = [
  { id: "artist-development", label: "Artist development" },
  { id: "booking", label: "Booking" },
  { id: "partnership", label: "Partnership / brand" },
  { id: "press", label: "Press / media" },
  { id: "consulting", label: "Consulting" },
  { id: "general", label: "General" },
] as const;

export const genres = ["R&B", "Hip-Hop", "Pop", "Gospel", "Reggae", "Dance", "Soul", "Afrobeats", "Country", "Other"];

/** Canonical origin. Production domain is megentllc.com; override with NEXT_PUBLIC_SITE_URL. */
export const PRODUCTION_URL = "https://megentllc.com";
export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:4990");
  return raw.replace(/\/$/, "");
}
export function dashaunUrl() {
  return (process.env.NEXT_PUBLIC_DASHAUN_URL || "https://dashaungrey.com").replace(/\/$/, "");
}

export type Money = { cents: number; label: string };

export type Single = {
  id: "show-me" | "wtda";
  title: string;
  featured?: string;
  world: "showme" | "wtda";
  preview: string;
  cover: string;
  coverMobile: string;
  cover4k: string;
  plate: string;
  plateMobile: string;
  plate4k: string;
  plateVideo: string;
  sku: string;
  price: Money;
  explicit: boolean;
  blurb: string;
  vibe: string;
};

export type MerchItem = {
  id: string;
  title: string;
  world: "showme" | "wtda";
  kind: "tee" | "hoodie" | "poster";
  image: string;
  imageMobile: string;
  sku: string;
  printfulProductId: string | null;
  price: Money;
  blurb: string;
};

export const artist = {
  name: "Dashaun Grey",
  formerly: "Que Williams",
  born: "MaQuell Williams",
  hometown: "Loris, South Carolina",
  roles: "Singer · Rapper · Songwriter",
  label: "MEG Enterprises, LLC",
  album: "World of Grey",
  albumWhen: "early next year",
  tagline: "New Name. New Chapter. Different Shades.",
  quote:
    "Music is therapeutic. I use it to help myself and others who can relate. After a long season of illness and life changes, you begin to see how life evolves. I've learned that life reveals many different shades of grey.",
};

export const singles: Single[] = [
  {
    id: "show-me",
    title: "Show Me",
    featured: "ft. Juiicy 2xs",
    world: "showme",
    preview: "/audio/previews/show-me.m4a",
    cover: "/media/covers/show-me.jpg",
    coverMobile: "/media/covers/show-me-m.jpg",
    cover4k: "/media/covers/show-me-4k.jpg",
    plate: "/media/plates/show-me.jpg",
    plateMobile: "/media/plates/show-me-m.jpg",
    plate4k: "/media/plates/show-me-4k.jpg",
    plateVideo: "/media/plates/show-me.mp4",
    sku: "single-show-me",
    price: { cents: 199, label: "$1.99" },
    explicit: true,
    blurb:
      "The other side of Grey. Smooth, melodic, candlelit — the record that reminds you why you fell in love with him in the first place.",
    vibe: "burgundy · gold foil · midnight lounge",
  },
  {
    id: "wtda",
    title: "Where Dem Dollars At",
    world: "wtda",
    preview: "/audio/previews/wtda.m4a",
    cover: "/media/covers/wtda.jpg",
    coverMobile: "/media/covers/wtda-m.jpg",
    cover4k: "/media/covers/wtda-4k.jpg",
    plate: "/media/plates/wtda.jpg",
    plateMobile: "/media/plates/wtda-m.jpg",
    plate4k: "/media/plates/wtda-4k.jpg",
    plateVideo: "/media/plates/wtda.mp4",
    sku: "single-wtda",
    price: { cents: 199, label: "$1.99" },
    explicit: true,
    blurb:
      "Self-written. High-energy club and dance. The reintroduction — towels on, sunglasses on, newspaper open.",
    vibe: "newsprint · cat-eyes · we don't guess, we get",
  },
];

export const merch: MerchItem[] = [
  {
    id: "show-me-tee",
    title: "Show Me Gold-Foil Tee",
    world: "showme",
    kind: "tee",
    image: "/media/merch/show-me-tee.jpg",
    imageMobile: "/media/merch/show-me-tee-m.jpg",
    sku: "merch-show-me-tee",
    printfulProductId: null,
    price: { cents: 3800, label: "$38" },
    blurb: "Heavyweight black. Distressed gold brush across the chest.",
  },
  {
    id: "show-me-hoodie",
    title: "Velvet Hour Hoodie",
    world: "showme",
    kind: "hoodie",
    image: "/media/merch/show-me-hoodie.jpg",
    imageMobile: "/media/merch/show-me-hoodie-m.jpg",
    sku: "merch-show-me-hoodie",
    printfulProductId: null,
    price: { cents: 6800, label: "$68" },
    blurb: "Oxblood velvet. Gold chain-link at the heart.",
  },
  {
    id: "show-me-poster",
    title: "Show Me Poster",
    world: "showme",
    kind: "poster",
    image: "/media/covers/show-me.jpg",
    imageMobile: "/media/covers/show-me-m.jpg",
    sku: "merch-show-me-poster",
    printfulProductId: null,
    price: { cents: 2400, label: "$24" },
    blurb: "Official cover. 18×24. Gold edge.",
  },
  {
    id: "wtda-tee",
    title: "Tabloid Tee",
    world: "wtda",
    kind: "tee",
    image: "/media/merch/wtda-tee.jpg",
    imageMobile: "/media/merch/wtda-tee-m.jpg",
    sku: "merch-wtda-tee",
    printfulProductId: null,
    price: { cents: 3800, label: "$38" },
    blurb: "Bone heavyweight. Circled newsprint stamp.",
  },
  {
    id: "wtda-hoodie",
    title: "We Don't Guess Hoodie",
    world: "wtda",
    kind: "hoodie",
    image: "/media/merch/wtda-hoodie.jpg",
    imageMobile: "/media/merch/wtda-hoodie-m.jpg",
    sku: "merch-wtda-hoodie",
    printfulProductId: null,
    price: { cents: 6800, label: "$68" },
    blurb: "Charcoal. Pink sticky-note. Focus. Plan. Stack. Repeat.",
  },
  {
    id: "wtda-poster",
    title: "Newsstand Poster",
    world: "wtda",
    kind: "poster",
    image: "/media/covers/wtda.jpg",
    imageMobile: "/media/covers/wtda-m.jpg",
    sku: "merch-wtda-poster",
    printfulProductId: null,
    price: { cents: 2400, label: "$24" },
    blurb: "Official cover. 18×24. Tabloid energy, framed.",
  },
];

export const socials = [
  { id: "instagram", label: "Instagram", href: "#" },
  { id: "tiktok", label: "TikTok", href: "#" },
  { id: "spotify", label: "Spotify", href: "#" },
  { id: "apple", label: "Apple Music", href: "#" },
  { id: "youtube", label: "YouTube", href: "#" },
];

/**
 * Streaming links. Replace "#" with the artist profile / track URLs.
 * Order here is the order rendered in the Listen menu and DSP rows.
 */
export type Dsp = { id: "spotify" | "apple" | "youtube" | "tidal" | "amazon"; label: string; href: string };
export const dsps: Dsp[] = [
  { id: "spotify", label: "Spotify", href: "#" },
  { id: "apple", label: "Apple Music", href: "#" },
  { id: "youtube", label: "YouTube", href: "#" },
  { id: "tidal", label: "Tidal", href: "#" },
  { id: "amazon", label: "Amazon", href: "#" },
];

/**
 * Honors — sourced from the official bio. Wording is deliberate:
 * "Grammy ballot consideration", not a win. Do not inflate.
 */
export const honors = [
  {
    id: "grammy",
    title: "Grammy Ballot",
    sub: "2011 · Three categories",
    detail: "Best R&B Performance by a Duo or Group · Best R&B Song · Best Contemporary R&B Album",
  },
  {
    id: "billboard",
    title: "Billboard",
    sub: "Hot R&B · Hot Pop · Greatest Gainer",
    detail: "“I’m Wit It” ft. Slick Pulla — 2011",
  },
  {
    id: "warner",
    title: "Signed at 14",
    sub: "Warner Bros. subsidiary · 2003",
    detail: "FaSho — the four-man group that built him",
  },
  {
    id: "screen",
    title: "Screen & Brand",
    sub: "MTV · Film · Adidas",
    detail: "MTV True Life · Joyful Noise · The Other Side · Rules · Adidas · 2T Water · Good Denim",
  },
];

/** "As seen" wordmarks for the hero press bar. Text only — no third-party logos. */
export const press = ["Billboard", "MTV", "Adidas", "ACE Magazine", "2T Water"];

/** Career facts surfaced in About. Sourced from the official bio. */
export const stats = [
  { n: "2003", label: "First deal, age 14" },
  { n: "Billboard", label: "Hot R&B · Greatest Gainer" },
  { n: "2011", label: "Grammy ballot" },
  { n: "Loris, SC", label: "Hometown" },
];

export const timeline = [
  { when: "2003", what: "Signs with FaSho at fourteen — Warner Bros. subsidiary." },
  { when: "2011", what: "“I’m Wit It” ft. Slick Pulla charts Billboard. Grammy ballot consideration." },
  { when: "2019", what: "Takes the reins at MEG Enterprises. Illness, healing, and a new name." },
  { when: "Now", what: "Show Me. Where Dem Dollars At. World of Grey on the way." },
];

/** MEG Enterprises — pulled from the company bio. */
export const label = {
  name: "MEG Enterprises, LLC",
  short: "MEG",
  tagline: "Independent Music. Developing Artists. Building Brands. Creating Legacy.",
  founder: "Dr. Glenda S. Williams",
  founderRole: "Founder · South Carolina native",
  years: "30+",
  yearsLabel: "years in music, artist development, and entertainment",
  intro:
    "An independent record label and family-founded entertainment company built on more than three decades of experience in music, artist development, management, promotion, and entertainment business strategy.",
  approach:
    "MEG gives artists an environment that supports creative development, professional growth, strategic release planning, branding, promotion, and long-term career development — while keeping an entrepreneurial approach to the business of music.",
  nextGen:
    "After more than 30 years in the industry, Dr. Williams began transitioning the company’s legacy to the next generation in 2019, passing greater leadership to her son, MaQuell Williams — known today as Dashaun Grey. More than a change in leadership: family, longevity, artistic development, business ownership, and legacy.",
  closing: "More Than Music. Building Legacy.",
  credits: [
    { t: "Billboard chart recognition", s: "Milestone" },
    { t: "Grammy ballot consideration", s: "Milestone" },
    { t: "The B.B. King Award", s: "Honor" },
    { t: "Khaotic’s BET Awards 2023 Takeover", s: "Project lead" },
    { t: "MTV True Life · Oprah’s Greenleaf", s: "Television" },
    { t: "IBNX Radio · stage plays · live productions", s: "Radio & stage" },
    { t: "Song placements for radio and television", s: "Sync" },
    { t: "Apparel sponsorships · magazine features", s: "Brand" },
  ],
};

export function findSku(sku: string) {
  return (
    singles.find((s) => s.sku === sku) ?? merch.find((m) => m.sku === sku) ?? null
  );
}

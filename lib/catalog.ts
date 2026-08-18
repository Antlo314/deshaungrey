export type Money = { cents: number; label: string };

export type Single = {
  id: "show-me" | "wtda";
  title: string;
  featured?: string;
  world: "showme" | "wtda";
  preview: string;
  cover: string;
  plate: string;
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
    plate: "/media/plates/show-me.jpg",
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
    plate: "/media/plates/wtda.jpg",
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

export function findSku(sku: string) {
  return (
    singles.find((s) => s.sku === sku) ?? merch.find((m) => m.sku === sku) ?? null
  );
}

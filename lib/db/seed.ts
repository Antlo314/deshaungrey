import type { Artist, Post, Release, Setting } from "./types";
import { DEFAULT_SITE_SETTINGS } from "./types";

/**
 * First-run data. Applied once, when the store has no artists and no settings.
 * Facts come from the Dashaun Grey artist bio and the MEG company bio.
 * The public site also renders from this when the database is unreachable,
 * so it must always be a complete, truthful snapshot.
 */

const T0 = "2026-08-18T12:00:00.000Z";

export const SEED_ARTISTS: Artist[] = [
  {
    id: "art_dashaun_grey",
    createdAt: T0,
    updatedAt: T0,
    slug: "dashaun-grey",
    name: "Dashaun Grey",
    formerly: "Que Williams",
    roles: "Singer · Rapper · Songwriter · President, MEG Enterprises",
    status: "active",
    featured: true,
    hometown: "Loris, South Carolina",
    short:
      "The reintroduction. Formerly known professionally as Que Williams, Dashaun Grey leads MEG's next chapter as both its president and its flagship artist — with the singles “Where Dem Dollars At” and “Show Me” ft. Juiicy 2xs leading toward his forthcoming solo project, World Of Grey.",
    bio:
      "MaQuell Williams — known today as Dashaun Grey — grew up inside the company. Signed at fourteen with the four-man group FaSho on a Warner Bros. subsidiary in 2003, he went on to Billboard chart recognition with “I'm Wit It” ft. Slick Pulla in 2011 and Grammy ballot consideration the same year, alongside screen and brand work spanning MTV True Life, film and Adidas.\n\nIn 2019, after more than 30 years in the industry, Dr. Glenda S. Williams began transitioning MEG Enterprises' leadership to her son. A long season of illness and life changes followed — and with it, a new name and a new chapter. As Dashaun Grey he returns with self-written, high-energy records and the melodic other side of Grey: “Where Dem Dollars At” and “Show Me” featuring Juiicy 2xs, leading toward the solo project World Of Grey.\n\nHe now leads MEG Enterprises' new era as an independent label while developing and positioning new music of his own.",
    quote:
      "Music is therapeutic. I use it to help myself and others who can relate. After a long season of illness and life changes, you begin to see how life evolves. I've learned that life reveals many different shades of grey.",
    image: "/media/roster/dashaun-grey.jpg",
    imageWide: "/media/roster/dashaun-grey-wide.jpg",
    site: "https://dashaungrey.com",
    links: [
      { label: "Official site", href: "https://dashaungrey.com" },
      { label: "Instagram", href: "" },
      { label: "Spotify", href: "" },
      { label: "Apple Music", href: "" },
      { label: "YouTube", href: "" },
    ],
    now: ["Show Me · out now", "Where Dem Dollars At · out now", "World Of Grey · forthcoming"],
    orderIndex: 1,
  },
];

export const SEED_RELEASES: Release[] = [
  {
    id: "rel_show_me",
    createdAt: T0,
    updatedAt: T0,
    slug: "show-me",
    title: "Show Me",
    artistId: "art_dashaun_grey",
    artistName: "Dashaun Grey",
    featuring: "ft. Juiicy 2xs",
    type: "single",
    status: "out",
    releaseDate: "2026",
    cover: "/media/releases/show-me.jpg",
    blurb: "The other side of Grey. Smooth, melodic, candlelit — the record that reminds you why you fell in love with him in the first place.",
    links: [
      { label: "Spotify", href: "" },
      { label: "Apple Music", href: "" },
      { label: "YouTube", href: "" },
      { label: "Artist site", href: "https://dashaungrey.com/#music" },
    ],
    featured: true,
    orderIndex: 1,
  },
  {
    id: "rel_wtda",
    createdAt: T0,
    updatedAt: T0,
    slug: "where-dem-dollars-at",
    title: "Where Dem Dollars At",
    artistId: "art_dashaun_grey",
    artistName: "Dashaun Grey",
    type: "single",
    status: "out",
    releaseDate: "2026",
    cover: "/media/releases/wtda.jpg",
    blurb: "Self-written. High-energy club and dance. The reintroduction — towels on, sunglasses on, newspaper open.",
    links: [
      { label: "Spotify", href: "" },
      { label: "Apple Music", href: "" },
      { label: "YouTube", href: "" },
      { label: "Artist site", href: "https://dashaungrey.com/#wtda" },
    ],
    featured: true,
    orderIndex: 2,
  },
  {
    id: "rel_world_of_grey",
    createdAt: T0,
    updatedAt: T0,
    slug: "world-of-grey",
    title: "World Of Grey",
    artistId: "art_dashaun_grey",
    artistName: "Dashaun Grey",
    type: "album",
    status: "upcoming",
    releaseDate: "Forthcoming",
    cover: "",
    blurb: "The forthcoming solo project. A new chapter for both the artist and the MEG Enterprises legacy.",
    links: [{ label: "Artist site", href: "https://dashaungrey.com/#album" }],
    featured: true,
    orderIndex: 3,
  },
];

export const SEED_POSTS: Post[] = [
  {
    id: "post_new_era",
    createdAt: T0,
    updatedAt: T0,
    slug: "meg-enterprises-enters-a-new-era-as-an-independent-label",
    title: "MEG Enterprises enters a new era as an independent label",
    kicker: "Company",
    excerpt:
      "With more than three decades behind it and a new generation of music ahead, MEG Enterprises is developing and positioning new music while expanding its relationships across radio, digital distribution, promotion and media.",
    body:
      "MEG Enterprises, LLC — the independent record label and family-founded entertainment company established by Dr. Glenda S. Williams — continues building on its foundation while entering a new era as an independent label.\n\nThe company is developing and positioning new music while expanding its relationships across radio, digital distribution, promotion, media, and the broader entertainment industry.\n\n## The next generation\n\nAfter more than 30 years in the entertainment industry, Dr. Williams began transitioning the company's legacy to the next generation in 2019, passing greater leadership responsibility to her son, MaQuell Williams, professionally known today as Dashaun Grey. The evolution represents more than a change in leadership — it reflects the foundation upon which MEG Enterprises was created: family, longevity, artistic development, business ownership, and legacy.\n\n## More than music. Building legacy.\n\nMEG Enterprises believes successful artist development requires more than recording great music. It requires vision, preparation, business strategy, creative development, proper positioning, and a team committed to the artist's long-term growth.",
    published: true,
    publishedAt: T0,
    authorName: "MEG Enterprises",
  },
  {
    id: "post_dashaun_reintro",
    createdAt: T0,
    updatedAt: T0,
    slug: "the-reintroduction-of-dashaun-grey",
    title: "The reintroduction of Dashaun Grey",
    kicker: "Roster",
    excerpt:
      "Formerly known professionally as Que Williams, Dashaun Grey returns with “Where Dem Dollars At” and “Show Me” featuring Juiicy 2xs — leading toward his forthcoming solo project, World Of Grey.",
    body:
      "Among MEG Enterprises' current priorities is the reintroduction of Dashaun Grey, formerly known professionally as Que Williams.\n\nHis upcoming music represents a new chapter for both the artist and the MEG Enterprises legacy, including the singles “Where Dem Dollars At” and “Show Me” featuring Juiicy 2xs, leading toward his forthcoming solo project, World Of Grey.\n\nVisit the artist's official site for previews, merchandise and the tour list.",
    published: true,
    publishedAt: T0,
    authorName: "MEG Enterprises",
  },
  {
    id: "post_bet_2023",
    createdAt: T0,
    updatedAt: T0,
    slug: "khaotic-bet-awards-2023-takeover",
    title: "MEG Enterprises leads Khaotic's BET Awards 2023 Takeover",
    kicker: "Collaboration",
    excerpt:
      "MEG Enterprises led “Khaotic's BET Awards 2023 Takeover,” during which Khaotic — known for his appearances within the Love & Hip Hop franchise — received an achievement honor.",
    body:
      "Among its collaborative projects, MEG Enterprises contributed project-management efforts surrounding “Appreciate Me” by Khaotic, known for his appearances within the Love & Hip Hop franchise.\n\nMEG Enterprises also led “Khaotic's BET Awards 2023 Takeover,” during which Khaotic received an achievement honor.\n\nThe company continues to collaborate with other entertainment professionals and organizations to expand opportunities for its artists and projects.",
    published: true,
    publishedAt: "2023-06-26T12:00:00.000Z",
    authorName: "MEG Enterprises",
  },
];

export const SEED_SETTINGS: Setting[] = [
  { id: "site", createdAt: T0, updatedAt: T0, key: "site", value: DEFAULT_SITE_SETTINGS },
];

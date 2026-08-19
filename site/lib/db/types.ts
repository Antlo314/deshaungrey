/** Everything the owners can edit lives as one of these documents. */

export type Kind =
  | "artist"
  | "release"
  | "event"
  | "post"
  | "inquiry"
  | "submission"
  | "user"
  | "setting"
  | "audit"
  | "auth_event";

export interface Doc {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ArtistStatus = "active" | "development" | "alumni" | "hidden";
export interface Artist extends Doc {
  slug: string;
  name: string;
  formerly?: string;
  roles: string;
  status: ArtistStatus;
  featured: boolean;
  hometown?: string;
  short: string;
  bio: string;
  quote?: string;
  image?: string;
  imageWide?: string;
  site?: string;
  links: { label: string; href: string }[];
  now: string[]; // "Show Me · out now" style chips
  orderIndex: number;
}

export type ReleaseType = "single" | "ep" | "album" | "feature" | "mixtape";
export type ReleaseStatus = "out" | "upcoming" | "catalog";
export interface Release extends Doc {
  slug: string;
  title: string;
  artistId?: string;
  artistName: string;
  featuring?: string;
  type: ReleaseType;
  status: ReleaseStatus;
  releaseDate?: string; // ISO date or free text like "2027"
  cover?: string;
  blurb?: string;
  links: { label: string; href: string }[];
  featured: boolean;
  orderIndex: number;
}

export type EventKind = "show" | "appearance" | "release" | "press" | "meeting" | "other";
export interface EventDoc extends Doc {
  title: string;
  kind: EventKind;
  startsAt: string; // ISO datetime
  endsAt?: string;
  city?: string;
  venue?: string;
  url?: string;
  notes?: string;
  artistId?: string;
  isPublic: boolean;
  status: "upcoming" | "past" | "cancelled";
}

export interface Post extends Doc {
  slug: string;
  title: string;
  kicker?: string;
  excerpt: string;
  body: string; // plain paragraphs separated by blank lines; lines starting with "## " are headings
  image?: string;
  published: boolean;
  publishedAt?: string;
  authorName?: string;
}

export type InquiryKind = "artist-development" | "booking" | "partnership" | "press" | "consulting" | "general";
export type InquiryStatus = "new" | "reviewing" | "replied" | "archived";
export interface Inquiry extends Doc {
  kind: InquiryKind;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source?: string;
  status: InquiryStatus;
  notes?: string;
  assignedTo?: string;
  ip?: string;
}

export type SubmissionStatus = "new" | "listening" | "shortlisted" | "meeting" | "passed" | "signed";
export interface Submission extends Doc {
  artistName: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  genre?: string;
  links: string[];
  message: string;
  status: SubmissionStatus;
  rating?: number; // 0-5
  notes?: string;
  ip?: string;
}

export type Role = "owner" | "admin" | "viewer";
export interface AdminUser extends Doc {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  disabled: boolean;
  lastLoginAt?: string;
  sessionVersion: number;
}

export interface Setting extends Doc {
  key: string;
  value: unknown;
}

export interface Audit extends Doc {
  actor: string;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}

export interface AuthEvent extends Doc {
  email: string;
  ip: string;
  ok: boolean;
}

/** Site-wide settings the owners can edit. Stored under key "site". */
export interface SiteSettings {
  contactEmail: string;
  bookingEmail: string;
  pressEmail: string;
  phone: string;
  city: string;
  announcement: string;
  announcementHref: string;
  socials: { label: string; href: string }[];
  dsps: { label: string; href: string }[];
  submissionsOpen: boolean;
  submissionsNote: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contactEmail: "services@megentllc.com",
  bookingEmail: "services@megentllc.com",
  pressEmail: "services@megentllc.com",
  phone: "678-750-3247",
  city: "",
  announcement: "",
  announcementHref: "",
  socials: [
    { label: "Instagram", href: "" },
    { label: "TikTok", href: "" },
    { label: "YouTube", href: "" },
    { label: "Facebook", href: "" },
  ],
  dsps: [
    { label: "Spotify", href: "" },
    { label: "Apple Music", href: "" },
    { label: "YouTube Music", href: "" },
    { label: "Tidal", href: "" },
    { label: "Amazon Music", href: "" },
  ],
  submissionsOpen: true,
  submissionsNote: "We listen to everything. Links only — no attachments. If it's a fit, you'll hear from a person, not a form.",
};

export type ListOpts = {
  where?: Record<string, string | number | boolean>;
  orderBy?: string; // "createdAt" | "updatedAt" | any top-level field
  dir?: "asc" | "desc";
  numeric?: boolean; // sort the field numerically
  limit?: number;
  offset?: number;
};

export interface Store {
  readonly backend: "json" | "postgres";
  list<T extends Doc>(kind: Kind, opts?: ListOpts): Promise<T[]>;
  get<T extends Doc>(kind: Kind, id: string): Promise<T | null>;
  find<T extends Doc>(kind: Kind, field: string, value: string | number | boolean): Promise<T | null>;
  put<T extends Doc>(kind: Kind, doc: T): Promise<T>;
  patch<T extends Doc>(kind: Kind, id: string, patch: Partial<T>): Promise<T | null>;
  remove(kind: Kind, id: string): Promise<boolean>;
  count(kind: Kind, where?: Record<string, string | number | boolean>): Promise<number>;
  ping(): Promise<{ ok: boolean; detail: string }>;
}

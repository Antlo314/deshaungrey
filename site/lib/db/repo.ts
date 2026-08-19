import "server-only";
import { ensureSeed, newId, now, store } from "./index";
import { SEED_ARTISTS, SEED_POSTS, SEED_RELEASES } from "./seed";
import {
  DEFAULT_SITE_SETTINGS,
  type Artist,
  type Audit,
  type EventDoc,
  type Inquiry,
  type Post,
  type Release,
  type Setting,
  type SiteSettings,
  type Submission,
} from "./types";

/**
 * Public reads never throw: if the database is unreachable the site renders
 * from the seed snapshot and logs the failure. Admin reads/writes throw so the
 * dashboard can show the real error.
 */
async function safe<T>(fn: () => Promise<T>, fallback: T, what: string): Promise<T> {
  try {
    await ensureSeed();
    return await fn();
  } catch (e) {
    console.error(`[meg] ${what} failed, serving fallback:`, (e as Error).message);
    return fallback;
  }
}

// ---------- settings ----------
export async function getSiteSettings(): Promise<SiteSettings> {
  return safe(
    async () => {
      const s = await store().get<Setting>("setting", "site");
      return { ...DEFAULT_SITE_SETTINGS, ...((s?.value as Partial<SiteSettings>) ?? {}) };
    },
    DEFAULT_SITE_SETTINGS,
    "settings"
  );
}
export async function saveSiteSettings(value: SiteSettings): Promise<void> {
  const s = store();
  const cur = await s.get<Setting>("setting", "site");
  const t = now();
  await s.put<Setting>("setting", { id: "site", key: "site", value, createdAt: cur?.createdAt ?? t, updatedAt: t });
}

// ---------- artists ----------
export async function publicArtists(): Promise<Artist[]> {
  return safe(
    async () => {
      const all = await store().list<Artist>("artist", { orderBy: "orderIndex", numeric: true, dir: "asc" });
      return all.filter((a) => a.status !== "hidden");
    },
    SEED_ARTISTS,
    "artists"
  );
}
export async function publicArtistBySlug(slug: string): Promise<Artist | null> {
  return safe(
    async () => {
      const a = await store().find<Artist>("artist", "slug", slug);
      return a && a.status !== "hidden" ? a : null;
    },
    SEED_ARTISTS.find((a) => a.slug === slug) ?? null,
    "artist"
  );
}
export async function allArtists(): Promise<Artist[]> {
  await ensureSeed();
  return store().list<Artist>("artist", { orderBy: "orderIndex", numeric: true, dir: "asc" });
}
export async function getArtist(id: string): Promise<Artist | null> {
  await ensureSeed();
  return store().get<Artist>("artist", id);
}
export async function saveArtist(input: Omit<Artist, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Artist> {
  const s = store();
  const t = now();
  const existing = input.id ? await s.get<Artist>("artist", input.id) : null;
  const doc: Artist = { ...(existing ?? {}), ...input, id: existing?.id ?? input.id ?? newId("art"), createdAt: existing?.createdAt ?? t, updatedAt: t } as Artist;
  return s.put("artist", doc);
}
export async function deleteArtist(id: string): Promise<boolean> {
  return store().remove("artist", id);
}

// ---------- releases ----------
export async function publicReleases(): Promise<Release[]> {
  return safe(
    () => store().list<Release>("release", { orderBy: "orderIndex", numeric: true, dir: "asc" }),
    SEED_RELEASES,
    "releases"
  );
}
export async function allReleases(): Promise<Release[]> {
  await ensureSeed();
  return store().list<Release>("release", { orderBy: "orderIndex", numeric: true, dir: "asc" });
}
export async function getRelease(id: string): Promise<Release | null> {
  await ensureSeed();
  return store().get<Release>("release", id);
}
export async function saveRelease(input: Omit<Release, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Release> {
  const s = store();
  const t = now();
  const existing = input.id ? await s.get<Release>("release", input.id) : null;
  const doc: Release = { ...(existing ?? {}), ...input, id: existing?.id ?? input.id ?? newId("rel"), createdAt: existing?.createdAt ?? t, updatedAt: t } as Release;
  return s.put("release", doc);
}
export async function deleteRelease(id: string): Promise<boolean> {
  return store().remove("release", id);
}

// ---------- posts ----------
export async function publicPosts(): Promise<Post[]> {
  return safe(
    async () => {
      const all = await store().list<Post>("post", { orderBy: "publishedAt", dir: "desc" });
      return all.filter((p) => p.published);
    },
    SEED_POSTS,
    "posts"
  );
}
export async function publicPostBySlug(slug: string): Promise<Post | null> {
  return safe(
    async () => {
      const p = await store().find<Post>("post", "slug", slug);
      return p && p.published ? p : null;
    },
    SEED_POSTS.find((p) => p.slug === slug) ?? null,
    "post"
  );
}
export async function allPosts(): Promise<Post[]> {
  await ensureSeed();
  return store().list<Post>("post", { orderBy: "updatedAt", dir: "desc" });
}
export async function getPost(id: string): Promise<Post | null> {
  await ensureSeed();
  return store().get<Post>("post", id);
}
export async function savePost(input: Omit<Post, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Post> {
  const s = store();
  const t = now();
  const existing = input.id ? await s.get<Post>("post", input.id) : null;
  const doc: Post = { ...(existing ?? {}), ...input, id: existing?.id ?? input.id ?? newId("post"), createdAt: existing?.createdAt ?? t, updatedAt: t } as Post;
  return s.put("post", doc);
}
export async function deletePost(id: string): Promise<boolean> {
  return store().remove("post", id);
}

// ---------- events ----------
export async function publicEvents(): Promise<EventDoc[]> {
  return safe(
    async () => {
      const all = await store().list<EventDoc>("event", { orderBy: "startsAt", dir: "asc" });
      return all.filter((e) => e.isPublic && e.status !== "cancelled");
    },
    [],
    "events"
  );
}
export async function allEvents(): Promise<EventDoc[]> {
  await ensureSeed();
  return store().list<EventDoc>("event", { orderBy: "startsAt", dir: "asc" });
}
export async function getEvent(id: string): Promise<EventDoc | null> {
  return store().get<EventDoc>("event", id);
}
export async function saveEvent(input: Omit<EventDoc, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<EventDoc> {
  const s = store();
  const t = now();
  const existing = input.id ? await s.get<EventDoc>("event", input.id) : null;
  const doc: EventDoc = { ...(existing ?? {}), ...input, id: existing?.id ?? input.id ?? newId("evt"), createdAt: existing?.createdAt ?? t, updatedAt: t } as EventDoc;
  return s.put("event", doc);
}
export async function deleteEvent(id: string): Promise<boolean> {
  return store().remove("event", id);
}

// ---------- inquiries + submissions ----------
export async function createInquiry(input: Omit<Inquiry, "id" | "createdAt" | "updatedAt" | "status">): Promise<Inquiry> {
  const t = now();
  const doc: Inquiry = { ...input, id: newId("inq"), status: "new", createdAt: t, updatedAt: t };
  return store().put("inquiry", doc);
}
export async function listInquiries(opts?: { status?: string; limit?: number }): Promise<Inquiry[]> {
  await ensureSeed();
  return store().list<Inquiry>("inquiry", { where: opts?.status ? { status: opts.status } : undefined, orderBy: "createdAt", dir: "desc", limit: opts?.limit ?? 500 });
}
export async function getInquiry(id: string): Promise<Inquiry | null> {
  return store().get<Inquiry>("inquiry", id);
}
export async function patchInquiry(id: string, patch: Partial<Inquiry>): Promise<Inquiry | null> {
  return store().patch<Inquiry>("inquiry", id, patch);
}
export async function deleteInquiry(id: string): Promise<boolean> {
  return store().remove("inquiry", id);
}

export async function createSubmission(input: Omit<Submission, "id" | "createdAt" | "updatedAt" | "status">): Promise<Submission> {
  const t = now();
  const doc: Submission = { ...input, id: newId("sub"), status: "new", createdAt: t, updatedAt: t };
  return store().put("submission", doc);
}
export async function listSubmissions(opts?: { status?: string; limit?: number }): Promise<Submission[]> {
  await ensureSeed();
  return store().list<Submission>("submission", { where: opts?.status ? { status: opts.status } : undefined, orderBy: "createdAt", dir: "desc", limit: opts?.limit ?? 500 });
}
export async function getSubmission(id: string): Promise<Submission | null> {
  return store().get<Submission>("submission", id);
}
export async function patchSubmission(id: string, patch: Partial<Submission>): Promise<Submission | null> {
  return store().patch<Submission>("submission", id, patch);
}
export async function deleteSubmission(id: string): Promise<boolean> {
  return store().remove("submission", id);
}

// ---------- audit ----------
export async function audit(actor: string, action: string, target?: string, meta?: Record<string, unknown>): Promise<void> {
  try {
    const t = now();
    await store().put<Audit>("audit", { id: newId("aud"), actor, action, target, meta, createdAt: t, updatedAt: t });
  } catch (e) {
    console.error("[meg] audit failed:", (e as Error).message);
  }
}
export async function recentAudit(limit = 40): Promise<Audit[]> {
  return store().list<Audit>("audit", { orderBy: "createdAt", dir: "desc", limit });
}

// ---------- overview counts ----------
export async function overviewCounts() {
  await ensureSeed();
  const s = store();
  const [inqNew, inqAll, subNew, subAll, artists, releases, posts, events] = await Promise.all([
    s.count("inquiry", { status: "new" }),
    s.count("inquiry"),
    s.count("submission", { status: "new" }),
    s.count("submission"),
    s.count("artist"),
    s.count("release"),
    s.count("post"),
    s.count("event"),
  ]);
  return { inqNew, inqAll, subNew, subAll, artists, releases, posts, events };
}

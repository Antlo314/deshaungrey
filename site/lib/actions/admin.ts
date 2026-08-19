"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { can, createUser, getSession, hashPassword, passwordProblems, verifyPassword, type Session } from "@/lib/auth";
import { now, slugify, store } from "@/lib/db";
import {
  audit,
  deleteArtist,
  deleteEvent,
  deleteInquiry,
  deletePost,
  deleteRelease,
  deleteSubmission,
  getArtist,
  getPost,
  getRelease,
  patchInquiry,
  patchSubmission,
  saveArtist,
  saveEvent,
  savePost,
  saveRelease,
  saveSiteSettings,
} from "@/lib/db/repo";
import type { AdminUser, ArtistStatus, EventKind, InquiryStatus, ReleaseStatus, ReleaseType, Role, SiteSettings, SubmissionStatus } from "@/lib/db/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/db/types";

export type ActionState = { error?: string; ok?: boolean; message?: string };

async function requireRole(need: Role): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!can(s.role, need)) throw new Error("You don't have permission to do that.");
  return s;
}

const str = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true" || fd.get(k) === "1";
const num = (fd: FormData, k: string, d = 0) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? n : d;
};
const lines = (fd: FormData, k: string) => str(fd, k, 4000).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
function links(fd: FormData, prefix = "link", max = 8) {
  const out: { label: string; href: string }[] = [];
  for (let i = 0; i < max; i++) {
    const label = str(fd, `${prefix}_label_${i}`, 60);
    const href = str(fd, `${prefix}_href_${i}`, 400);
    if (label || href) out.push({ label: label || "Link", href });
  }
  return out;
}
const oneOf = <T extends string>(v: string, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);
const bust = () => revalidatePath("/", "layout");
const wrap = async (fn: () => Promise<ActionState | void>): Promise<ActionState> => {
  try {
    return (await fn()) ?? { ok: true };
  } catch (e) {
    unstable_rethrow(e); // let redirect() / notFound() through
    return { error: (e as Error).message || "Something went wrong." };
  }
};

// ---------- artists ----------
export async function saveArtistAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id", 80) || undefined;
    const name = str(fd, "name", 120);
    if (name.length < 2) return { error: "Name is required." };
    const existing = id ? await getArtist(id) : null;
    const slug = slugify(str(fd, "slug", 80) || name) || slugify(name);
    const doc = await saveArtist({
      id,
      slug,
      name,
      formerly: str(fd, "formerly", 120) || undefined,
      roles: str(fd, "roles", 200),
      status: oneOf<ArtistStatus>(str(fd, "status", 20), ["active", "development", "alumni", "hidden"], "active"),
      featured: bool(fd, "featured"),
      hometown: str(fd, "hometown", 120) || undefined,
      short: str(fd, "short", 600),
      bio: str(fd, "bio", 8000),
      quote: str(fd, "quote", 600) || undefined,
      image: str(fd, "image", 400) || undefined,
      imageWide: str(fd, "imageWide", 400) || undefined,
      site: str(fd, "site", 300) || undefined,
      links: links(fd),
      now: lines(fd, "now"),
      orderIndex: num(fd, "orderIndex", existing?.orderIndex ?? 99),
    });
    await audit(s.email, id ? "artist.update" : "artist.create", doc.name);
    bust();
    redirect(`/admin/roster?saved=${encodeURIComponent(doc.name)}`);
  });
}
export async function deleteArtistAction(fd: FormData): Promise<void> {
  const s = await requireRole("owner");
  const id = str(fd, "id", 80);
  const a = await getArtist(id);
  if (a) {
    await deleteArtist(id);
    await audit(s.email, "artist.delete", a.name);
    bust();
  }
  redirect("/admin/roster");
}

// ---------- releases ----------
export async function saveReleaseAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id", 80) || undefined;
    const title = str(fd, "title", 160);
    if (title.length < 1) return { error: "Title is required." };
    const existing = id ? await getRelease(id) : null;
    const artistId = str(fd, "artistId", 80) || undefined;
    const artist = artistId ? await getArtist(artistId) : null;
    const doc = await saveRelease({
      id,
      slug: slugify(str(fd, "slug", 80) || title) || slugify(title),
      title,
      artistId,
      artistName: artist?.name || str(fd, "artistName", 120) || "MEG Enterprises",
      featuring: str(fd, "featuring", 160) || undefined,
      type: oneOf<ReleaseType>(str(fd, "type", 20), ["single", "ep", "album", "feature", "mixtape"], "single"),
      status: oneOf<ReleaseStatus>(str(fd, "status", 20), ["out", "upcoming", "catalog"], "out"),
      releaseDate: str(fd, "releaseDate", 40) || undefined,
      cover: str(fd, "cover", 400) || undefined,
      blurb: str(fd, "blurb", 600) || undefined,
      links: links(fd),
      featured: bool(fd, "featured"),
      orderIndex: num(fd, "orderIndex", existing?.orderIndex ?? 99),
    });
    await audit(s.email, id ? "release.update" : "release.create", doc.title);
    bust();
    redirect(`/admin/releases?saved=${encodeURIComponent(doc.title)}`);
  });
}
export async function deleteReleaseAction(fd: FormData): Promise<void> {
  const s = await requireRole("owner");
  const id = str(fd, "id", 80);
  const r = await getRelease(id);
  if (r) {
    await deleteRelease(id);
    await audit(s.email, "release.delete", r.title);
    bust();
  }
  redirect("/admin/releases");
}

// ---------- posts ----------
export async function savePostAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id", 80) || undefined;
    const title = str(fd, "title", 200);
    if (title.length < 3) return { error: "Title is required." };
    const existing = id ? await getPost(id) : null;
    const published = bool(fd, "published");
    const publishedAtRaw = str(fd, "publishedAt", 40);
    const publishedAt = publishedAtRaw ? new Date(publishedAtRaw).toISOString() : existing?.publishedAt || (published ? now() : undefined);
    const doc = await savePost({
      id,
      slug: slugify(str(fd, "slug", 80) || title) || slugify(title),
      title,
      kicker: str(fd, "kicker", 60) || undefined,
      excerpt: str(fd, "excerpt", 600),
      body: str(fd, "body", 30000),
      image: str(fd, "image", 400) || undefined,
      published,
      publishedAt,
      authorName: str(fd, "authorName", 120) || s.name || "MEG Enterprises",
    });
    await audit(s.email, id ? "post.update" : "post.create", doc.title);
    bust();
    redirect(`/admin/press?saved=${encodeURIComponent(doc.title)}`);
  });
}
export async function deletePostAction(fd: FormData): Promise<void> {
  const s = await requireRole("owner");
  const id = str(fd, "id", 80);
  const p = await getPost(id);
  if (p) {
    await deletePost(id);
    await audit(s.email, "post.delete", p.title);
    bust();
  }
  redirect("/admin/press");
}

// ---------- events ----------
export async function saveEventAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id", 80) || undefined;
    const title = str(fd, "title", 200);
    if (title.length < 2) return { error: "Title is required." };
    const startsRaw = str(fd, "startsAt", 40);
    if (!startsRaw || Number.isNaN(Date.parse(startsRaw))) return { error: "A valid start date/time is required." };
    const startsAt = new Date(startsRaw).toISOString();
    const endsRaw = str(fd, "endsAt", 40);
    const doc = await saveEvent({
      id,
      title,
      kind: oneOf<EventKind>(str(fd, "kind", 20), ["show", "appearance", "release", "press", "meeting", "other"], "other"),
      startsAt,
      endsAt: endsRaw && !Number.isNaN(Date.parse(endsRaw)) ? new Date(endsRaw).toISOString() : undefined,
      city: str(fd, "city", 120) || undefined,
      venue: str(fd, "venue", 160) || undefined,
      url: str(fd, "url", 400) || undefined,
      notes: str(fd, "notes", 4000) || undefined,
      artistId: str(fd, "artistId", 80) || undefined,
      isPublic: bool(fd, "isPublic"),
      status: oneOf(str(fd, "status", 20), ["upcoming", "past", "cancelled"] as const, "upcoming"),
    });
    await audit(s.email, id ? "event.update" : "event.create", doc.title);
    bust();
    redirect(`/admin/events?saved=${encodeURIComponent(doc.title)}`);
  });
}
export async function deleteEventAction(fd: FormData): Promise<void> {
  const s = await requireRole("admin");
  const id = str(fd, "id", 80);
  await deleteEvent(id);
  await audit(s.email, "event.delete", id);
  bust();
  redirect("/admin/events");
}

// ---------- inbox ----------
export async function updateInquiryAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id", 80);
    const status = oneOf<InquiryStatus>(str(fd, "status", 20), ["new", "reviewing", "replied", "archived"], "new");
    const r = await patchInquiry(id, { status, notes: str(fd, "notes", 4000), assignedTo: str(fd, "assignedTo", 120) || undefined });
    if (!r) return { error: "That inquiry no longer exists." };
    await audit(s.email, "inquiry.update", `${r.name} → ${status}`);
    return { ok: true, message: "Saved." };
  });
}
export async function quickInquiryStatusAction(fd: FormData): Promise<void> {
  const s = await requireRole("admin");
  const id = str(fd, "id", 80);
  const status = oneOf<InquiryStatus>(str(fd, "status", 20), ["new", "reviewing", "replied", "archived"], "new");
  await patchInquiry(id, { status });
  await audit(s.email, "inquiry.status", `${id} → ${status}`);
  revalidatePath("/admin/inbox");
}
export async function deleteInquiryAction(fd: FormData): Promise<void> {
  const s = await requireRole("owner");
  const id = str(fd, "id", 80);
  await deleteInquiry(id);
  await audit(s.email, "inquiry.delete", id);
  redirect("/admin/inbox");
}

export async function updateSubmissionAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const id = str(fd, "id", 80);
    const status = oneOf<SubmissionStatus>(str(fd, "status", 20), ["new", "listening", "shortlisted", "meeting", "passed", "signed"], "new");
    const rating = Math.max(0, Math.min(5, num(fd, "rating", 0)));
    const r = await patchSubmission(id, { status, rating, notes: str(fd, "notes", 4000) });
    if (!r) return { error: "That submission no longer exists." };
    await audit(s.email, "submission.update", `${r.artistName} → ${status}`);
    return { ok: true, message: "Saved." };
  });
}
export async function quickSubmissionStatusAction(fd: FormData): Promise<void> {
  const s = await requireRole("admin");
  const id = str(fd, "id", 80);
  const status = oneOf<SubmissionStatus>(str(fd, "status", 20), ["new", "listening", "shortlisted", "meeting", "passed", "signed"], "new");
  await patchSubmission(id, { status });
  await audit(s.email, "submission.status", `${id} → ${status}`);
  revalidatePath("/admin/submissions");
}
export async function deleteSubmissionAction(fd: FormData): Promise<void> {
  const s = await requireRole("owner");
  const id = str(fd, "id", 80);
  await deleteSubmission(id);
  await audit(s.email, "submission.delete", id);
  redirect("/admin/submissions");
}

// ---------- team ----------
export async function createUserAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("owner");
    const email = str(fd, "email", 200).toLowerCase();
    const name = str(fd, "name", 120);
    const role = oneOf<Role>(str(fd, "role", 20), ["owner", "admin", "viewer"], "admin");
    const password = String(fd.get("password") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "That email doesn't look right." };
    if (name.length < 2) return { error: "Name is required." };
    const pp = passwordProblems(password);
    if (pp) return { error: pp };
    if (await store().find<AdminUser>("user", "email", email)) return { error: "That email already has access." };
    const u = await createUser({ email, name, role, password });
    await audit(s.email, "user.create", `${u.email} (${role})`);
    revalidatePath("/admin/team");
    return { ok: true, message: `${name} can now sign in with ${email}.` };
  });
}
export async function setUserAction(fd: FormData): Promise<void> {
  const s = await requireRole("owner");
  const id = str(fd, "id", 80);
  const op = str(fd, "op", 20);
  const target = await store().get<AdminUser>("user", id);
  if (!target) return;
  const owners = (await store().list<AdminUser>("user")).filter((u) => u.role === "owner" && !u.disabled);
  if (op === "disable") {
    if (target.id === s.uid) throw new Error("You can't disable yourself.");
    if (target.role === "owner" && owners.length <= 1) throw new Error("Keep at least one active owner.");
    await store().patch<AdminUser>("user", id, { disabled: true, sessionVersion: target.sessionVersion + 1 });
  } else if (op === "enable") {
    await store().patch<AdminUser>("user", id, { disabled: false });
  } else if (op === "delete") {
    if (target.id === s.uid) throw new Error("You can't delete yourself.");
    if (target.role === "owner" && owners.length <= 1) throw new Error("Keep at least one owner.");
    await store().remove("user", id);
  } else if (op === "signout") {
    await store().patch<AdminUser>("user", id, { sessionVersion: target.sessionVersion + 1 });
  } else if (op.startsWith("role:")) {
    const role = oneOf<Role>(op.slice(5), ["owner", "admin", "viewer"], target.role);
    if (target.id === s.uid && role !== "owner") throw new Error("You can't demote yourself.");
    await store().patch<AdminUser>("user", id, { role });
  }
  await audit(s.email, `user.${op}`, target.email);
  revalidatePath("/admin/team");
}
export async function resetPasswordAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("owner");
    const id = str(fd, "id", 80);
    const password = String(fd.get("password") ?? "");
    const pp = passwordProblems(password);
    if (pp) return { error: pp };
    const target = await store().get<AdminUser>("user", id);
    if (!target) return { error: "User not found." };
    await store().patch<AdminUser>("user", id, { passwordHash: await hashPassword(password), sessionVersion: target.sessionVersion + 1 });
    await audit(s.email, "user.password_reset", target.email);
    return { ok: true, message: `Password updated for ${target.email}. Their other sessions were signed out.` };
  });
}
export async function changeMyPasswordAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("viewer");
    const current = String(fd.get("current") ?? "");
    const password = String(fd.get("password") ?? "");
    if (!(await verifyPassword(current, s.user.passwordHash))) return { error: "Current password is wrong." };
    const pp = passwordProblems(password);
    if (pp) return { error: pp };
    await store().patch<AdminUser>("user", s.uid, { passwordHash: await hashPassword(password) });
    await audit(s.email, "user.password_change");
    return { ok: true, message: "Password changed." };
  });
}

// ---------- settings ----------
export async function saveSettingsAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return wrap(async () => {
    const s = await requireRole("admin");
    const socials = links(fd, "social", 8);
    const dsps = links(fd, "dsp", 8);
    const value: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      contactEmail: str(fd, "contactEmail", 200),
      bookingEmail: str(fd, "bookingEmail", 200),
      pressEmail: str(fd, "pressEmail", 200),
      phone: str(fd, "phone", 60),
      city: str(fd, "city", 120),
      announcement: str(fd, "announcement", 160),
      announcementHref: str(fd, "announcementHref", 300),
      socials: socials.length ? socials : DEFAULT_SITE_SETTINGS.socials,
      dsps: dsps.length ? dsps : DEFAULT_SITE_SETTINGS.dsps,
      submissionsOpen: bool(fd, "submissionsOpen"),
      submissionsNote: str(fd, "submissionsNote", 400) || DEFAULT_SITE_SETTINGS.submissionsNote,
    };
    await saveSiteSettings(value);
    await audit(s.email, "settings.update");
    bust();
    return { ok: true, message: "Settings saved. The public site updates immediately." };
  });
}

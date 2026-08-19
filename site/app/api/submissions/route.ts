import { NextResponse } from "next/server";
import { createSubmission, getSiteSettings } from "@/lib/db/repo";
import { clean, cleanBlock, isEmail, notify, rateLimited, requestIp, sameOrigin, urlish } from "@/lib/public-api";

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ ok: false, message: "Bad origin." }, { status: 403 });
  const ip = await requestIp();
  if (rateLimited(`sub:${ip}`, 4)) return NextResponse.json({ ok: false, message: "Too many submissions from this connection. Try again later." }, { status: 429 });

  const settings = await getSiteSettings().catch(() => null);
  if (settings && settings.submissionsOpen === false) return NextResponse.json({ ok: false, message: "Submissions are closed right now." }, { status: 423 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (clean(body.website)) return NextResponse.json({ ok: true });

  const artistName = clean(body.artistName, 120);
  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 60);
  const city = clean(body.city, 120);
  const genre = clean(body.genre, 60);
  const message = cleanBlock(body.message, 3000);
  const rawLinks = Array.isArray(body.links) ? (body.links as unknown[]) : String(body.links ?? "").split(/[\n,]+/);
  const links = rawLinks.map((l) => urlish(String(l ?? ""))).filter(Boolean).slice(0, 6);

  if (artistName.length < 1) return NextResponse.json({ ok: false, message: "What name do you perform under?" }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ ok: false, message: "Tell us who you are." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ ok: false, message: "That email doesn't look right." }, { status: 400 });
  if (!links.length) return NextResponse.json({ ok: false, message: "Add at least one link to your music (Spotify, YouTube, SoundCloud, a private link — anything we can press play on)." }, { status: 400 });

  try {
    const doc = await createSubmission({ artistName, name, email, phone, city, genre, links, message, ip });
    void notify({ type: "submission", id: doc.id, artistName, name, email, phone, city, genre, links, message, at: doc.createdAt });
    return NextResponse.json({ ok: true, id: doc.id });
  } catch (e) {
    console.error("[meg] submission store failed:", (e as Error).message);
    void notify({ type: "submission", artistName, name, email, phone, city, genre, links, message, at: new Date().toISOString(), storeError: true });
    return NextResponse.json({ ok: true, queued: true });
  }
}

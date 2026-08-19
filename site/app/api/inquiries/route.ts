import { NextResponse } from "next/server";
import { createInquiry, getSiteSettings } from "@/lib/db/repo";
import { clean, cleanBlock, isEmail, notify, rateLimited, requestIp, sameOrigin } from "@/lib/public-api";
import { inquiryKinds } from "@/lib/content";
import type { InquiryKind } from "@/lib/db/types";

export async function POST(req: Request) {
  if (!(await sameOrigin())) return NextResponse.json({ ok: false, message: "Bad origin." }, { status: 403 });
  const ip = await requestIp();
  if (rateLimited(`inq:${ip}`, 6)) return NextResponse.json({ ok: false, message: "Too many messages from this connection. Try again in a few minutes." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (clean(body.website)) return NextResponse.json({ ok: true }); // honeypot — pretend success

  const kindRaw = clean(body.kind, 40) as InquiryKind;
  const kind: InquiryKind = inquiryKinds.some((k) => k.id === kindRaw) ? kindRaw : "general";
  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 60);
  const company = clean(body.company, 160);
  const message = cleanBlock(body.message, 4000);

  if (name.length < 2) return NextResponse.json({ ok: false, message: "Tell us your name." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ ok: false, message: "That email doesn't look right." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ ok: false, message: "Give us a little more than that." }, { status: 400 });

  try {
    const doc = await createInquiry({ kind, name, email, phone, company, message, source: clean(body.source, 80) || "site", ip });
    const settings = await getSiteSettings().catch(() => null);
    void notify({ type: "inquiry", id: doc.id, kind, name, email, phone, company, message, at: doc.createdAt, routeTo: kind === "booking" ? settings?.bookingEmail : kind === "press" ? settings?.pressEmail : settings?.contactEmail });
    return NextResponse.json({ ok: true, id: doc.id });
  } catch (e) {
    console.error("[meg] inquiry store failed:", (e as Error).message);
    // Still notify so nothing is lost even if the DB is down.
    void notify({ type: "inquiry", kind, name, email, phone, company, message, at: new Date().toISOString(), storeError: true });
    return NextResponse.json({ ok: true, queued: true });
  }
}

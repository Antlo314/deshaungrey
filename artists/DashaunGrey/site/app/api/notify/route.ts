import { NextResponse } from "next/server";
import { mkdir, appendFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    city?: string;
    interest?: string;
  };
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: "Need a real email." }, { status: 400 });
  }

  const row = {
    at: new Date().toISOString(),
    email,
    city: String(body.city || "").trim(),
    interest: String(body.interest || "tour").trim(),
  };

  const webhook = process.env.NOTIFY_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
    } catch {
      /* fall through to file */
    }
  }

  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "notify.jsonl"), `${JSON.stringify(row)}\n`, "utf8");
  } catch {
    /* serverless filesystems may be read-only */
  }

  return NextResponse.json({ ok: true });
}

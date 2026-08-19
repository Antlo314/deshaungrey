import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  canIssueSignedUrl,
  consumeTurn,
  markSignedUrlIssued,
  quotaStatus,
  visitorKey,
} from "@/lib/quota";
import { elevenReady, getSignedUrl } from "@/lib/voice";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "unknown";
  const cookies = parseCookie(req.headers.get("cookie") || "");
  const id = cookies[COOKIE_NAME] || visitorKey(ip, ua);

  const before = quotaStatus(id);
  if (before.timedOut || before.remaining <= 0) {
    return NextResponse.json(
      { ok: false, reason: "timeout", ...before },
      { status: 429 }
    );
  }

  if (!canIssueSignedUrl()) {
    return NextResponse.json(
      { ok: false, reason: "daily_cap", ...before },
      { status: 429 }
    );
  }

  if (!elevenReady()) {
    const after = consumeTurn(id);
    const res = NextResponse.json({
      ok: false,
      reason: "agent_unwired",
      ...after,
    });
    stampCookie(res, id);
    return res;
  }

  const signedUrl = await getSignedUrl();
  if (!signedUrl) {
    return NextResponse.json(
      { ok: false, reason: "eleven_error", ...before },
      { status: 503 }
    );
  }

  markSignedUrlIssued();
  const after = consumeTurn(id);
  const res = NextResponse.json({ ok: true, signedUrl, ...after });
  stampCookie(res, id);
  return res;
}

function stampCookie(res: NextResponse, id: string) {
  res.cookies.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

function parseCookie(raw: string) {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

import { NextResponse } from "next/server";
import { COOKIE_NAME, quotaStatus, visitorKey } from "@/lib/quota";
import { elevenReady } from "@/lib/voice";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "unknown";
  const cookie = parseCookie(req.headers.get("cookie") || "")[COOKIE_NAME];
  const id = cookie || visitorKey(ip, ua);
  // agentWired tells the widget whether a live ElevenLabs call is even possible,
  // so it never offers a "live call" button that can only fail.
  return NextResponse.json({ ...quotaStatus(id), agentWired: elevenReady() });
}

function parseCookie(raw: string) {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

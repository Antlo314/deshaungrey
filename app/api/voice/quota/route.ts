import { NextResponse } from "next/server";
import { COOKIE_NAME, quotaStatus, visitorKey } from "@/lib/quota";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "unknown";
  const cookie = parseCookie(req.headers.get("cookie") || "")[COOKIE_NAME];
  const id = cookie || visitorKey(ip, ua);
  return NextResponse.json(quotaStatus(id));
}

function parseCookie(raw: string) {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

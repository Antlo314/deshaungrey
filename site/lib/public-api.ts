import "server-only";
import { headers } from "next/headers";

/** Small helpers shared by the public form routes. */

const g = globalThis as unknown as { __megRl?: Map<string, number[]> };
function bucket(): Map<string, number[]> {
  if (!g.__megRl) g.__megRl = new Map();
  return g.__megRl;
}

/** Sliding-window rate limit per key. In-memory (per instance) — enough to stop a script, not a botnet. */
export function rateLimited(key: string, max = 8, windowMs = 10 * 60 * 1000): boolean {
  const b = bucket();
  const nowT = Date.now();
  const arr = (b.get(key) ?? []).filter((t) => nowT - t < windowMs);
  if (arr.length >= max) {
    b.set(key, arr);
    return true;
  }
  arr.push(nowT);
  b.set(key, arr);
  if (b.size > 5000) b.clear();
  return false;
}

export async function requestIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") || h.get("x-real-ip") || "local").split(",")[0].trim();
}

/** Same-origin check for JSON posts from the site's own forms. */
export async function sameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin || !host) return true; // curl / no-origin clients: let validation + limits handle it
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
export const clean = (v: unknown, max = 500) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
export const cleanBlock = (v: unknown, max = 4000) => String(v ?? "").replace(/\r/g, "").trim().slice(0, max);

export function urlish(s: string): string {
  const t = s.trim();
  if (!t) return "";
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (!/^https?:$/.test(u.protocol)) return "";
    return u.toString().slice(0, 300);
  } catch {
    return "";
  }
}

/** Fire-and-forget webhook (Zapier / Make / Slack / Telegram relay). Never blocks the response. */
export async function notify(payload: Record<string, unknown>): Promise<void> {
  const hook = process.env.NOTIFY_WEBHOOK;
  if (!hook) return;
  try {
    await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(4000) });
  } catch (e) {
    console.error("[meg] webhook failed:", (e as Error).message);
  }
}

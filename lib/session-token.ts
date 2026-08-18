/**
 * Signed session tokens — Web Crypto only, so the same code verifies in the
 * proxy (request edge) and in server components / actions.
 *
 *   token = base64url(json payload) + "." + base64url(HMAC-SHA256(payload))
 *
 * No `server-only` import here on purpose: proxy.ts imports it.
 */

import type { Role } from "./db/types";

export type SessionPayload = {
  uid: string;
  email: string;
  role: Role;
  name: string;
  v: number; // user.sessionVersion — bump to sign everyone out
  exp: number; // ms epoch
};

const DEV_SECRET = "meg-dev-secret-do-not-use-in-production";

export function sessionSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  return null;
}
export function secretIsWeak(): boolean {
  return sessionSecret() === DEV_SECRET || !process.env.SESSION_SECRET;
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret), unb64url(sig) as BufferSource, new TextEncoder().encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(unb64url(body))) as SessionPayload;
    if (!payload || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (!payload.uid || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

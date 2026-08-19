import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies, headers } from "next/headers";
import { ensureSeed, newId, now, store } from "./db";
import type { AdminUser, AuthEvent, Role } from "./db/types";
import { signToken, verifyToken, type SessionPayload } from "./session-token";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;

export const COOKIE = "meg_admin";
const SESSION_DAYS = 7;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

// ---------- passwords ----------
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, 32, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algo, N, r, p, saltB64, hashB64] = stored.split("$");
    if (algo !== "scrypt") return false;
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(hashB64, "base64url");
    const key = await scrypt(password.normalize("NFKC"), salt, expected.length, { N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem });
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}
export function passwordProblems(pw: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return "Mix letters and numbers.";
  return null;
}

// ---------- session cookie ----------
export async function issueSession(user: AdminUser): Promise<void> {
  const exp = Date.now() + SESSION_DAYS * 86400 * 1000;
  const token = await signToken({ uid: user.id, email: user.email, role: user.role, name: user.name, v: user.sessionVersion, exp });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(exp),
  });
}
export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export type Session = SessionPayload & { user: AdminUser };

/** Full check: signature, expiry, and the user still exists / is enabled / same session version. */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const payload = await verifyToken(raw);
  if (!payload) return null;
  try {
    await ensureSeed();
    const user = await store().get<AdminUser>("user", payload.uid);
    if (!user || user.disabled || user.sessionVersion !== payload.v) return null;
    return { ...payload, user };
  } catch {
    return null;
  }
}

export function can(role: Role, need: Role): boolean {
  const rank: Record<Role, number> = { viewer: 0, admin: 1, owner: 2 };
  return rank[role] >= rank[need];
}

// ---------- users ----------
export async function userCount(): Promise<number> {
  await ensureSeed();
  return store().count("user");
}
export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  return store().find<AdminUser>("user", "email", email.trim().toLowerCase());
}
export async function createUser(input: { email: string; name: string; role: Role; password: string }): Promise<AdminUser> {
  const t = now();
  const user: AdminUser = {
    id: newId("usr"),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    passwordHash: await hashPassword(input.password),
    disabled: false,
    sessionVersion: 1,
    createdAt: t,
    updatedAt: t,
  };
  return store().put("user", user);
}

/**
 * First-run owner. If ADMIN_EMAIL + ADMIN_PASSWORD are set and there are no
 * users yet, create the owner silently. Returns true if it did.
 */
export async function bootstrapOwnerFromEnv(): Promise<boolean> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return false;
  if ((await userCount()) > 0) return false;
  await createUser({ email, name: "Owner", role: "owner", password });
  return true;
}

/** Whether the in-browser first-run setup screen may be shown. */
export async function setupAllowed(token?: string): Promise<{ ok: boolean; reason: string }> {
  if ((await userCount()) > 0) return { ok: false, reason: "An owner already exists. Sign in instead." };
  const isProd = process.env.NODE_ENV === "production";
  const required = process.env.ADMIN_SETUP_TOKEN;
  if (isProd && !required) return { ok: false, reason: "Set ADMIN_SETUP_TOKEN (or ADMIN_EMAIL + ADMIN_PASSWORD) in your environment to create the first owner." };
  if (required && token !== required) return { ok: false, reason: "Setup token missing or wrong." };
  return { ok: true, reason: "" };
}

// ---------- login throttle ----------
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") || h.get("x-real-ip") || "local").split(",")[0].trim();
}
export async function loginLocked(email: string, ip: string): Promise<boolean> {
  try {
    const rows = await store().list<AuthEvent>("auth_event", { where: { email }, orderBy: "createdAt", dir: "desc", limit: 30 });
    const since = Date.now() - WINDOW_MS;
    const fails = rows.filter((r) => !r.ok && (r.ip === ip || true) && Date.parse(r.createdAt) > since);
    return fails.length >= MAX_FAILS;
  } catch {
    return false;
  }
}
export async function recordLogin(email: string, ip: string, ok: boolean): Promise<void> {
  try {
    const t = now();
    await store().put<AuthEvent>("auth_event", { id: newId("auth"), email, ip, ok, createdAt: t, updatedAt: t });
  } catch {
    /* never block login on telemetry */
  }
}

"use server";

import { redirect } from "next/navigation";
import {
  bootstrapOwnerFromEnv,
  clearSession,
  clientIp,
  createUser,
  findUserByEmail,
  getSession,
  issueSession,
  loginLocked,
  passwordProblems,
  recordLogin,
  setupAllowed,
  verifyPassword,
} from "@/lib/auth";
import { audit } from "@/lib/db/repo";
import { store, now } from "@/lib/db";
import { sessionSecret } from "@/lib/session-token";
import type { AdminUser } from "@/lib/db/types";

export type AuthState = { error?: string; ok?: boolean };

const safeNext = (n: unknown) => {
  const s = String(n ?? "");
  return s.startsWith("/admin") && !s.startsWith("//") ? s : "/admin";
};

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!email || !password) return { error: "Email and password, please." };
  if (!sessionSecret()) return { error: "SESSION_SECRET is not set on the server. Add it in Vercel → Settings → Environment Variables and redeploy." };

  await bootstrapOwnerFromEnv();
  const ip = await clientIp();
  if (await loginLocked(email, ip)) return { error: "Too many attempts. Wait 15 minutes and try again." };

  const user = await findUserByEmail(email);
  const ok = !!user && !user.disabled && (await verifyPassword(password, user.passwordHash));
  await recordLogin(email, ip, ok);
  if (!ok || !user) {
    // constant-ish response either way
    return { error: "That email and password don't match." };
  }
  await store().patch<AdminUser>("user", user.id, { lastLoginAt: now() });
  await issueSession(user);
  await audit(user.email, "login");
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const s = await getSession();
  await clearSession();
  if (s) await audit(s.email, "logout");
  redirect("/admin/login");
}

export async function setupOwnerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const allowed = await setupAllowed(token || undefined);
  if (!allowed.ok) return { error: allowed.reason };
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (name.length < 2) return { error: "Your name, please." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "That email doesn't look right." };
  const pp = passwordProblems(password);
  if (pp) return { error: pp };
  if (password !== confirm) return { error: "Passwords don't match." };
  if (!sessionSecret()) return { error: "SESSION_SECRET is not set on the server." };
  const user = await createUser({ email, name, role: "owner", password });
  await issueSession(user);
  await audit(user.email, "setup.owner");
  redirect("/admin");
}

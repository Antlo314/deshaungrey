import "server-only";
import { jsonStore } from "./json-store";
import { databaseUrl, pgStore } from "./pg-store";
import { SEED_ARTISTS, SEED_POSTS, SEED_RELEASES, SEED_SETTINGS } from "./seed";
import type { Store } from "./types";

const g = globalThis as unknown as { __megSeeded?: Promise<void> | null };

/** The active store. Postgres when a connection string exists, JSON otherwise. */
export function store(): Store {
  return databaseUrl() ? pgStore : jsonStore;
}

/** True when running somewhere the JSON store cannot persist (serverless, no DB). */
export function ephemeral(): boolean {
  return !databaseUrl() && !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Seed once per process if the store is empty. Safe to call from every read. */
export async function ensureSeed(): Promise<void> {
  if (g.__megSeeded) return g.__megSeeded;
  g.__megSeeded = (async () => {
    const s = store();
    const [artists, settings] = await Promise.all([s.count("artist"), s.count("setting")]);
    if (artists === 0) {
      for (const a of SEED_ARTISTS) await s.put("artist", a);
      for (const r of SEED_RELEASES) await s.put("release", r);
      for (const p of SEED_POSTS) await s.put("post", p);
    }
    if (settings === 0) for (const st of SEED_SETTINGS) await s.put("setting", st);
  })().catch((e) => {
    g.__megSeeded = null; // retry next time
    throw e;
  });
  return g.__megSeeded;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function slugify(input: string): string {
  // NFKD splits accented letters into base + combining marks (U+0300–U+036F); drop the marks.
  const plain = Array.from(input.normalize("NFKD"))
    .filter((ch) => {
      const c = ch.codePointAt(0) ?? 0;
      return c < 0x300 || c > 0x36f;
    })
    .join("");
  return plain
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

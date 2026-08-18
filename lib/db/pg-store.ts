import postgres, { type Sql } from "postgres";
import type { Doc, Kind, ListOpts, Store } from "./types";

/**
 * Postgres store — one JSONB document table. Works with Neon (Vercel Storage),
 * Supabase (use the pooler URL), or any Postgres 12+.
 *
 * Why a document table and not one table per entity: this site has a handful
 * of admins and a few hundred rows per kind. One table, one code path, one
 * migration, and the JSON dev store behaves identically — far less surface for
 * the two backends to drift apart.
 */

const TABLE = "meg_documents";

const g = globalThis as unknown as { __megPg?: { sql: Sql; ready: Promise<void> | null; url: string } };

export function databaseUrl(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || null;
}

function sql(): Sql {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set");
  if (g.__megPg && g.__megPg.url === url) return g.__megPg.sql;
  const local = /localhost|127\.0\.0\.1/.test(url);
  const client = postgres(url, {
    max: process.env.VERCEL ? 1 : 4,
    idle_timeout: 20,
    connect_timeout: 12,
    prepare: false, // pgbouncer / Supabase transaction pooler safe
    ssl: local ? false : "require",
    onnotice: () => {},
  });
  g.__megPg = { sql: client, ready: null, url };
  return client;
}

async function ready(): Promise<Sql> {
  const s = sql();
  if (!g.__megPg!.ready) {
    g.__megPg!.ready = (async () => {
      await s.unsafe(`
        CREATE TABLE IF NOT EXISTS ${TABLE} (
          kind text NOT NULL,
          id text NOT NULL,
          data jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (kind, id)
        );
        CREATE INDEX IF NOT EXISTS ${TABLE}_kind_updated ON ${TABLE} (kind, updated_at DESC);
        CREATE INDEX IF NOT EXISTS ${TABLE}_kind_created ON ${TABLE} (kind, created_at DESC);
        CREATE INDEX IF NOT EXISTS ${TABLE}_slug ON ${TABLE} (kind, (data->>'slug'));
        CREATE INDEX IF NOT EXISTS ${TABLE}_email ON ${TABLE} (kind, (data->>'email'));
      `);
    })().catch((e) => {
      g.__megPg!.ready = null;
      throw e;
    });
  }
  await g.__megPg!.ready;
  return s;
}

const SAFE_FIELD = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function whereSql(s: Sql, where?: Record<string, string | number | boolean>) {
  if (!where || !Object.keys(where).length) return s``;
  const parts = Object.entries(where).map(([k, v]) => {
    if (!SAFE_FIELD.test(k)) throw new Error(`bad field ${k}`);
    return s`AND data->>${k} = ${String(v)}`;
  });
  return parts.reduce((acc, p) => s`${acc} ${p}`, s``);
}

function orderSql(s: Sql, opts?: ListOpts) {
  const key = opts?.orderBy ?? "createdAt";
  const dir = opts?.dir ?? (opts?.orderBy ? "asc" : "desc");
  if (!SAFE_FIELD.test(key)) throw new Error(`bad order field ${key}`);
  if (key === "createdAt") return dir === "asc" ? s`ORDER BY created_at ASC` : s`ORDER BY created_at DESC`;
  if (key === "updatedAt") return dir === "asc" ? s`ORDER BY updated_at ASC` : s`ORDER BY updated_at DESC`;
  if (opts?.numeric) {
    return dir === "asc"
      ? s`ORDER BY NULLIF(data->>${key}, '')::numeric ASC NULLS LAST, created_at DESC`
      : s`ORDER BY NULLIF(data->>${key}, '')::numeric DESC NULLS LAST, created_at DESC`;
  }
  return dir === "asc"
    ? s`ORDER BY data->>${key} ASC NULLS LAST, created_at DESC`
    : s`ORDER BY data->>${key} DESC NULLS LAST, created_at DESC`;
}

export const pgStore: Store = {
  backend: "postgres",
  async list<T extends Doc>(kind: Kind, opts?: ListOpts): Promise<T[]> {
    const s = await ready();
    const lim = Math.min(Math.max(opts?.limit ?? 5000, 1), 5000);
    const off = Math.max(opts?.offset ?? 0, 0);
    const rows = await s<{ data: T }[]>`
      SELECT data FROM ${s(TABLE)} WHERE kind = ${kind} ${whereSql(s, opts?.where)}
      ${orderSql(s, opts)} LIMIT ${lim} OFFSET ${off}`;
    return rows.map((r) => r.data);
  },
  async get<T extends Doc>(kind: Kind, id: string): Promise<T | null> {
    const s = await ready();
    const rows = await s<{ data: T }[]>`SELECT data FROM ${s(TABLE)} WHERE kind = ${kind} AND id = ${id} LIMIT 1`;
    return rows[0]?.data ?? null;
  },
  async find<T extends Doc>(kind: Kind, field: string, value: string | number | boolean): Promise<T | null> {
    if (!SAFE_FIELD.test(field)) throw new Error(`bad field ${field}`);
    const s = await ready();
    const rows = await s<{ data: T }[]>`SELECT data FROM ${s(TABLE)} WHERE kind = ${kind} AND data->>${field} = ${String(value)} ORDER BY created_at ASC LIMIT 1`;
    return rows[0]?.data ?? null;
  },
  async put<T extends Doc>(kind: Kind, doc: T): Promise<T> {
    const s = await ready();
    await s`
      INSERT INTO ${s(TABLE)} (kind, id, data, created_at, updated_at)
      VALUES (${kind}, ${doc.id}, ${s.json(doc as unknown as never)}, ${doc.createdAt}, ${doc.updatedAt})
      ON CONFLICT (kind, id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`;
    return doc;
  },
  async patch<T extends Doc>(kind: Kind, id: string, patch: Partial<T>): Promise<T | null> {
    const s = await ready();
    const cur = await pgStore.get<T>(kind, id);
    if (!cur) return null;
    const next = { ...cur, ...patch, id, updatedAt: new Date().toISOString() } as T;
    await s`UPDATE ${s(TABLE)} SET data = ${s.json(next as unknown as never)}, updated_at = ${next.updatedAt} WHERE kind = ${kind} AND id = ${id}`;
    return next;
  },
  async remove(kind: Kind, id: string): Promise<boolean> {
    const s = await ready();
    const r = await s`DELETE FROM ${s(TABLE)} WHERE kind = ${kind} AND id = ${id}`;
    return r.count > 0;
  },
  async count(kind: Kind, where?: Record<string, string | number | boolean>): Promise<number> {
    const s = await ready();
    const rows = await s<{ n: string }[]>`SELECT count(*)::text AS n FROM ${s(TABLE)} WHERE kind = ${kind} ${whereSql(s, where)}`;
    return Number(rows[0]?.n ?? 0);
  },
  async ping() {
    try {
      const s = await ready();
      const r = await s<{ v: string }[]>`SELECT version() AS v`;
      const host = (() => {
        try {
          return new URL(databaseUrl()!.replace(/^postgres(ql)?:/, "http:")).host;
        } catch {
          return "postgres";
        }
      })();
      return { ok: true, detail: `${host} · ${r[0]?.v.split(" ").slice(0, 2).join(" ")}` };
    } catch (e) {
      return { ok: false, detail: (e as Error).message };
    }
  },
};

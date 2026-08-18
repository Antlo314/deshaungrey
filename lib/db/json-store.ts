import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { Doc, Kind, ListOpts, Store } from "./types";

/**
 * Local-development store: one JSON file, written atomically.
 * Never used in production when DATABASE_URL is set. On a serverless host with
 * no database it falls back to /tmp so the app still functions (data is
 * ephemeral there — the admin shows a banner in that case).
 */

type Table = Record<string, Doc>;
type DbFile = Partial<Record<Kind, Table>>;

const g = globalThis as unknown as { __megJson?: { file: string; data: DbFile | null; loading: Promise<DbFile> | null; writing: Promise<void> } };

function fileFor(): string {
  if (process.env.MEG_DB_FILE) return process.env.MEG_DB_FILE;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return path.join("/tmp", "meg-db.json");
  return path.join(process.cwd(), "data", "meg-db.json");
}

function state() {
  if (!g.__megJson) g.__megJson = { file: fileFor(), data: null, loading: null, writing: Promise.resolve() };
  return g.__megJson;
}

async function load(): Promise<DbFile> {
  const s = state();
  if (s.data) return s.data;
  if (s.loading) return s.loading;
  s.loading = (async () => {
    try {
      const raw = await readFile(s.file, "utf8");
      s.data = JSON.parse(raw) as DbFile;
    } catch {
      s.data = {};
    }
    return s.data!;
  })();
  return s.loading;
}

async function persist(): Promise<void> {
  const s = state();
  const data = s.data ?? {};
  // serialise writes so two actions cannot interleave a torn file
  s.writing = s.writing.then(async () => {
    await mkdir(path.dirname(s.file), { recursive: true });
    const tmp = `${s.file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 1), "utf8");
    await rename(tmp, s.file);
  });
  return s.writing;
}

function matches(doc: Doc, where?: Record<string, string | number | boolean>): boolean {
  if (!where) return true;
  const d = doc as unknown as Record<string, unknown>;
  return Object.entries(where).every(([k, v]) => String(d[k] ?? "") === String(v));
}

function sortDocs<T extends Doc>(rows: T[], opts?: ListOpts): T[] {
  const key = opts?.orderBy ?? "createdAt";
  const dir = opts?.dir ?? (opts?.orderBy ? "asc" : "desc");
  const numeric = !!opts?.numeric;
  return [...rows].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[key];
    const bv = (b as unknown as Record<string, unknown>)[key];
    let c: number;
    if (numeric) c = Number(av ?? 0) - Number(bv ?? 0);
    else c = String(av ?? "").localeCompare(String(bv ?? ""));
    return dir === "asc" ? c : -c;
  });
}

export const jsonStore: Store = {
  backend: "json",
  async list<T extends Doc>(kind: Kind, opts?: ListOpts): Promise<T[]> {
    const db = await load();
    const rows = Object.values(db[kind] ?? {}) as T[];
    const filtered = rows.filter((r) => matches(r, opts?.where));
    const sorted = sortDocs(filtered, opts);
    const off = opts?.offset ?? 0;
    const lim = opts?.limit ?? sorted.length;
    return sorted.slice(off, off + lim);
  },
  async get<T extends Doc>(kind: Kind, id: string): Promise<T | null> {
    const db = await load();
    return ((db[kind] ?? {})[id] as T | undefined) ?? null;
  },
  async find<T extends Doc>(kind: Kind, field: string, value: string | number | boolean): Promise<T | null> {
    const db = await load();
    const rows = Object.values(db[kind] ?? {}) as T[];
    return rows.find((r) => String((r as unknown as Record<string, unknown>)[field] ?? "") === String(value)) ?? null;
  },
  async put<T extends Doc>(kind: Kind, doc: T): Promise<T> {
    const db = await load();
    db[kind] ??= {};
    db[kind]![doc.id] = doc;
    await persist();
    return doc;
  },
  async patch<T extends Doc>(kind: Kind, id: string, patch: Partial<T>): Promise<T | null> {
    const db = await load();
    const cur = (db[kind] ?? {})[id] as T | undefined;
    if (!cur) return null;
    const next = { ...cur, ...patch, id, updatedAt: new Date().toISOString() } as T;
    db[kind]![id] = next;
    await persist();
    return next;
  },
  async remove(kind: Kind, id: string): Promise<boolean> {
    const db = await load();
    if (!db[kind]?.[id]) return false;
    delete db[kind]![id];
    await persist();
    return true;
  },
  async count(kind: Kind, where?: Record<string, string | number | boolean>): Promise<number> {
    const db = await load();
    return Object.values(db[kind] ?? {}).filter((r) => matches(r, where)).length;
  },
  async ping() {
    const s = state();
    return { ok: true, detail: `json file · ${s.file}` };
  },
};

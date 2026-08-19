import { NextResponse } from "next/server";
import { EMPTY_FACTS, deflect, localAnswer, systemPrompt, type MegFacts } from "@/lib/ash-brain";
import { getSiteSettings, publicArtists, publicPosts, publicReleases } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_Q = 400;

/** Daily ceiling on paid model calls so a scraper cannot run up a bill. */
const LLM_DAILY_CAP = 500;
const gate = { day: "", used: 0 };

function allowLlm() {
  const today = new Date().toISOString().slice(0, 10);
  if (gate.day !== today) {
    gate.day = today;
    gate.used = 0;
  }
  if (gate.used >= LLM_DAILY_CAP) return false;
  gate.used += 1;
  return true;
}

/**
 * Everything ASH is allowed to know, read fresh from the database so a new
 * signing or release is answerable the moment the owners save it. Cached for a
 * minute per instance — she is chatty and the roster does not move that fast.
 */
const cache: { at: number; facts: MegFacts | null } = { at: 0, facts: null };
const TTL = 60_000;

async function facts(): Promise<MegFacts> {
  if (cache.facts && Date.now() - cache.at < TTL) return cache.facts;
  try {
    const [artists, releases, posts, settings] = await Promise.all([
      publicArtists(),
      publicReleases(),
      publicPosts(),
      getSiteSettings(),
    ]);
    cache.facts = { artists, releases, posts, settings };
    cache.at = Date.now();
    return cache.facts;
  } catch (e) {
    console.error("[ash] could not load facts:", (e as Error).message);
    return cache.facts ?? EMPTY_FACTS;
  }
}

/** Optional: Anthropic if a key is present. Returns null on any problem. */
async function askClaude(question: string, history: { role: string; text: string }[], f: MegFacts) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !allowLlm()) return null;
  try {
    const messages = [
      ...history.slice(-6).map((m) => ({
        role: m.role === "ash" ? "assistant" : "user",
        content: m.text,
      })),
      { role: "user", content: question },
    ];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 240,
        system: systemPrompt(f),
        messages,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content || [])
      .filter((c) => c.type === "text")
      .map((c) => c.text || "")
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    question?: string;
    history?: { role: string; text: string }[];
  };
  const question = String(body.question || "").slice(0, MAX_Q).trim();
  if (!question) {
    return NextResponse.json({ ok: false, answer: "Say that again for me?" }, { status: 400 });
  }

  const f = await facts();

  // 1. grounded, free, always available
  const local = localAnswer(question, f);
  if (local) return NextResponse.json({ ok: true, answer: local, source: "kb" });

  // 2. a model, only if the owner wired a key — same facts, as its only source
  const smart = await askClaude(question, Array.isArray(body.history) ? body.history : [], f);
  if (smart) return NextResponse.json({ ok: true, answer: smart, source: "llm" });

  // 3. stay in character rather than dead-end
  return NextResponse.json({ ok: true, answer: deflect(question.length), source: "deflect" });
}

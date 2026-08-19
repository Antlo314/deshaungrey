import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, deflect, localAnswer } from "@/lib/ash-brain";

export const runtime = "nodejs";

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

/** Optional: Anthropic if a key is present. Returns null on any problem. */
async function askClaude(question: string, history: { role: string; text: string }[]) {
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
        max_tokens: 220,
        system: SYSTEM_PROMPT,
        messages,
      }),
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

  // 1. grounded, free, always available
  const local = localAnswer(question);
  if (local) return NextResponse.json({ ok: true, answer: local, source: "kb" });

  // 2. a model, only if the owner wired a key
  const smart = await askClaude(question, Array.isArray(body.history) ? body.history : []);
  if (smart) return NextResponse.json({ ok: true, answer: smart, source: "llm" });

  // 3. stay in character rather than dead-end
  return NextResponse.json({
    ok: true,
    answer: deflect(question.length),
    source: "deflect",
  });
}

import {
  COOKIE_NAME,
  VOICE_REPLY_CAP,
  consumeVoiceReply,
  visitorKey,
  voiceRepliesLeft,
} from "@/lib/quota";

export const runtime = "nodejs";

const MAX_CHARS = 400;
const DAILY_CHAR_CAP = 120_000; // global ceiling on top of the per-visit reply cap
const gate = { day: "", chars: 0 };

function allowChars(n: number) {
  const today = new Date().toISOString().slice(0, 10);
  if (gate.day !== today) {
    gate.day = today;
    gate.chars = 0;
  }
  if (gate.chars + n > DAILY_CHAR_CAP) return false;
  gate.chars += n;
  return true;
}

function parseCookie(raw: string) {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

function who(req: Request) {
  const cookies = parseCookie(req.headers.get("cookie") || "");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "unknown";
  // Without a cookie the bucket is hash(ip + ua), which lumps together everyone
  // behind one NAT. Stamping a cookie gives each browser its own allowance.
  return { id: cookies[COOKIE_NAME] || visitorKey(ip, ua), fresh: !cookies[COOKIE_NAME] };
}

function cookieHeader(id: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure}`;
}

/** How many spoken replies this visitor has left — costs nothing to ask. */
export async function GET(req: Request) {
  const { id } = who(req);
  return Response.json({
    left: voiceRepliesLeft(id),
    cap: VOICE_REPLY_CAP,
    wired: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID),
  });
}

/**
 * Speaks ASH's reply. The ElevenLabs key stays server-side; the browser only
 * ever receives audio bytes. Capped per visit so one visitor cannot drain it.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = String(body.text || "").slice(0, MAX_CHARS).trim();
  if (!text) return new Response("no text", { status: 400 });

  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return new Response("voice_unwired", { status: 503 });

  const { id, fresh } = who(req);
  const left = consumeVoiceReply(id);
  if (left === null) {
    return Response.json(
      { reason: "voice_cap", left: 0, cap: VOICE_REPLY_CAP },
      { status: 429 }
    );
  }
  if (!allowChars(text.length)) {
    return Response.json({ reason: "daily_cap", left, cap: VOICE_REPLY_CAP }, { status: 429 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.85,
            style: 0.45,
            use_speaker_boost: true,
          },
        }),
      }
    );
    if (!res.ok) return new Response("tts_error", { status: 502 });
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Ash-Voice-Left": String(left),
        "X-Ash-Voice-Cap": String(VOICE_REPLY_CAP),
        ...(fresh ? { "Set-Cookie": cookieHeader(id) } : {}),
      },
    });
  } catch {
    return new Response("tts_error", { status: 502 });
  }
}

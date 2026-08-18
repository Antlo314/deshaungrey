import { COOKIE_NAME, visitorKey } from "@/lib/quota";

export const runtime = "nodejs";

const MAX_CHARS = 400;
const DAILY_CHAR_CAP = 120_000; // ~ a few hundred replies; keeps TTS spend bounded
const gate = { day: "", chars: 0 };

function allow(n: number) {
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

/**
 * Speaks ASH's reply. The ElevenLabs key stays server-side; the browser only
 * ever receives audio bytes.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = String(body.text || "").slice(0, MAX_CHARS).trim();
  if (!text) return new Response("no text", { status: 400 });

  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return new Response("voice_unwired", { status: 503 });
  if (!allow(text.length)) return new Response("daily_cap", { status: 429 });

  // touch the visitor id so voice usage is attributable to a session
  const cookies = parseCookie(req.headers.get("cookie") || "");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "unknown";
  const id = cookies[COOKIE_NAME] || visitorKey(ip, ua);

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
        "X-Ash-Session": id.slice(0, 8),
      },
    });
  } catch {
    return new Response("tts_error", { status: 502 });
  }
}

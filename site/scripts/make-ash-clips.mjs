/**
 * Render ASH's cached clips with her CURRENT copy.
 *
 *   node scripts/make-ash-clips.mjs
 *
 * Two clips are pre-rendered rather than synthesised on demand:
 *   public/audio/ash/hello.mp3   — her greeting, played the moment she is opened,
 *                                  so she speaks instantly and it costs nothing
 *   public/audio/ash/timeout.mp3 — what she says when a visitor's voice budget runs out
 *
 * Re-run this whenever GREETING in lib/ash-brain.ts or TIMEOUT in
 * components/AshWidget.tsx changes, otherwise she SAYS one thing and the panel
 * SHOWS another. Voice settings here must match app/api/ash/speak/route.ts so the
 * cached clips and her live replies sound like the same person.
 *
 * Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (read from .env.local).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");

// tiny .env.local reader — no dependency needed for two values
function env(name) {
  if (process.env[name]) return process.env[name];
  const f = join(site, ".env.local");
  if (!existsSync(f)) return "";
  const m = readFileSync(f, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim() : "";
}

const KEY = env("ELEVENLABS_API_KEY");
const VOICE = env("ELEVENLABS_VOICE_ID");
if (!KEY || !VOICE) {
  console.error("ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are required (put them in site/.env.local).");
  process.exit(1);
}

/** Pull the live copy out of the source, so this can never drift from the UI. */
function copyFrom(file, pattern, label) {
  const src = readFileSync(join(site, file), "utf8");
  const m = src.match(pattern);
  if (!m) {
    console.error(`could not find ${label} in ${file}`);
    process.exit(1);
  }
  return m[1];
}

const GREETING = copyFrom("lib/ash-brain.ts", /export const GREETING = `([^`]+)`/, "GREETING");
const TIMEOUT = copyFrom("components/AshWidget.tsx", /const TIMEOUT = "([^"]+)"/, "TIMEOUT");

// backticks in GREETING are a template literal — resolve the one interpolation it uses
const resolved = GREETING.replace(/\$\{company\.name\}/g, "MEG Enterprises");

const CLIPS = [
  { name: "hello.mp3", text: resolved },
  { name: "timeout.mp3", text: TIMEOUT },
];

async function render({ name, text }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE)}`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      // must match app/api/ash/speak/route.ts
      voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    console.error(`  ${name}: ${res.status} ${await res.text().catch(() => "")}`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = join(site, "public", "audio", "ash", name);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  console.log(`  ${name.padEnd(12)} ${(buf.length / 1024).toFixed(0)} KB  "${text.slice(0, 60)}…"`);
  return true;
}

console.log("rendering ASH's cached clips in her own voice:");
let ok = true;
for (const c of CLIPS) ok = (await render(c)) && ok;
process.exit(ok ? 0 : 1);

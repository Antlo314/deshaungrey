/**
 * Designs ASH's voice from the written description in VOICE.md, saves every
 * preview so it can be auditioned, creates the voice on the account, writes the
 * id into .env.local, and re-renders the cached hello/timeout clips.
 *
 *   node scripts/design-ash-voice.mjs           # design + create + wire up
 *   node scripts/design-ash-voice.mjs --previews-only
 *   node scripts/design-ash-voice.mjs --use 2   # create from preview #2 instead
 *
 * Previews land in private/masters/ash-voice/ (never public).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const key = env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("no ELEVENLABS_API_KEY in .env.local");
  process.exit(1);
}
const H = { "xi-api-key": key, "Content-Type": "application/json" };

const args = process.argv.slice(2);
const previewsOnly = args.includes("--previews-only");
const useIdx = Number(args[args.indexOf("--use") + 1]) || 0;

const DESCRIPTION =
  "A young African-American woman in her early twenties. Rich, warm, smoky lower register " +
  "with a soft breathy edge — close-mic and intimate, like she is leaning in to tell you " +
  "something good. Modern Atlanta cadence: unhurried, a little playful, a little flirtatious, " +
  "always classy. Confident and smiling. Never squeaky, never valley-girl, never corporate, " +
  "never a caricature. She sounds like the best host at a late-night lounge who genuinely " +
  "loves this artist.";

const HELLO =
  "Hey. You made it into the World of Grey. I'm ASH — Dashaun's biggest fan. " +
  "You want the new singles, the merch, or you just wanna talk him?";
const TIMEOUT = "I gotta run — press play on Show Me for me. I'll be back in a few.";

const outDir = join(root, "private", "masters", "ash-voice");
mkdirSync(outDir, { recursive: true });

// ---- 1. design previews -----------------------------------------------------
const designRes = await fetch("https://api.elevenlabs.io/v1/text-to-voice/design", {
  method: "POST",
  headers: H,
  body: JSON.stringify({
    voice_description: DESCRIPTION,
    text: HELLO,
    model_id: "eleven_ttv_v3",
  }),
});
if (!designRes.ok) {
  console.error("design failed", designRes.status, (await designRes.text()).slice(0, 300));
  process.exit(1);
}
const previews = (await designRes.json()).previews || [];
console.log(`got ${previews.length} previews`);
previews.forEach((p, i) => {
  const f = join(outDir, `preview-${i}.mp3`);
  writeFileSync(f, Buffer.from(p.audio_base_64, "base64"));
  console.log(`  [${i}] ${p.generated_voice_id} -> ${f}`);
});
if (previewsOnly || !previews.length) process.exit(0);

// ---- 2. create the voice ----------------------------------------------------
const chosen = previews[useIdx] || previews[0];
const body = JSON.stringify({
  voice_name: "ASH — World of Grey",
  voice_description: DESCRIPTION,
  generated_voice_id: chosen.generated_voice_id,
});
let voiceId = null;
for (const url of [
  "https://api.elevenlabs.io/v1/text-to-voice",
  "https://api.elevenlabs.io/v1/text-to-voice/create-voice-from-preview",
]) {
  const r = await fetch(url, { method: "POST", headers: H, body });
  const t = await r.text();
  if (r.ok) {
    voiceId = JSON.parse(t).voice_id;
    console.log(`created voice via ${url}: ${voiceId}`);
    break;
  }
  console.log(`  ${url} -> ${r.status} ${t.slice(0, 160)}`);
}
if (!voiceId) {
  console.error(
    "Could not create the voice. Previews are saved above — create the voice in the " +
      "ElevenLabs dashboard (Voices -> Voice Design, paste the description from VOICE.md) " +
      "and put its id in ELEVENLABS_VOICE_ID."
  );
  process.exit(1);
}

// ---- 3. wire it into .env.local --------------------------------------------
const envPath = join(root, ".env.local");
let raw = readFileSync(envPath, "utf8");
raw = /ELEVENLABS_VOICE_ID=.*/.test(raw)
  ? raw.replace(/ELEVENLABS_VOICE_ID=.*/, `ELEVENLABS_VOICE_ID=${voiceId}`)
  : `${raw.trimEnd()}\nELEVENLABS_VOICE_ID=${voiceId}\n`;
writeFileSync(envPath, raw);
console.log("wrote ELEVENLABS_VOICE_ID to .env.local");

// ---- 4. re-render the cached clips ------------------------------------------
async function speak(text, out) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { ...H, Accept: "audio/mpeg" },
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
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", out);
}

const audioDir = join(root, "public", "audio", "ash");
mkdirSync(audioDir, { recursive: true });
await speak(HELLO, join(audioDir, "hello.mp3"));
await speak(TIMEOUT, join(audioDir, "timeout.mp3"));
console.log("done");

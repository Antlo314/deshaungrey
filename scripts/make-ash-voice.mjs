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
  console.error("no key");
  process.exit(1);
}

const voicesRes = await fetch("https://api.elevenlabs.io/v1/voices", {
  headers: { "xi-api-key": key },
});
if (!voicesRes.ok) {
  console.error("voices failed", voicesRes.status, await voicesRes.text());
  process.exit(1);
}
const voices = (await voicesRes.json()).voices || [];
const scored = voices.map((v) => {
  const labels = JSON.stringify(v.labels || {}).toLowerCase();
  const name = String(v.name || "").toLowerCase();
  let score = 0;
  if (v.labels?.gender === "female") score += 3;
  if (/young|youth/.test(labels)) score += 2;
  if (/african|black|southern|atlanta|american/.test(labels + name)) score += 4;
  if (/conversational|warm/.test(labels)) score += 1;
  return { id: v.voice_id, name: v.name, labels: v.labels, score };
});
scored.sort((a, b) => b.score - a.score);
const pick = scored[0] || voices[0];
console.log("picked", pick?.name, pick?.id, pick?.labels);

async function speak(id, text, out) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35 },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", out);
}

const dir = join(root, "public", "audio", "ash");
mkdirSync(dir, { recursive: true });
const voiceId = env.ELEVENLABS_VOICE_ID || pick.id;

await speak(
  voiceId,
  "Hey. You made it into the World of Grey. I'm ASH — Dashaun's biggest fan. You want the new singles, the merch, or you just wanna talk him?",
  join(dir, "hello.mp3")
);
await speak(
  voiceId,
  "I gotta run — press play on Show Me for me. I'll be back in a few.",
  join(dir, "timeout.mp3")
);

if (!env.ELEVENLABS_VOICE_ID) {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  writeFileSync(
    join(root, ".env.local"),
    raw.replace(/ELEVENLABS_VOICE_ID=.*/, `ELEVENLABS_VOICE_ID=${voiceId}`)
  );
  console.log("wrote voice id to .env.local");
}

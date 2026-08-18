/**
 * Enhance + resample every site image to 4K masters and responsive tiers.
 *
 *  - archives untouched originals to private/masters/originals/ (once)
 *  - uses the cross-free retouches from private/masters/retouch/ where present
 *  - clarity pass at native size → Lanczos3 resample → fine sharpen → mild tone
 *  - writes:  name-4k.jpg (3840 / 4096 wide), name.jpg (desktop), name-m.jpg (mobile)
 *
 * Run: node scripts/enhance-4k.mjs
 */
import sharp from "sharp";
import { mkdirSync, existsSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public", "media");
const RET = join(ROOT, "private", "masters", "retouch");
const ORIG = join(ROOT, "private", "masters", "originals");
mkdirSync(ORIG, { recursive: true });

function archive(rel) {
  const src = join(PUB, rel);
  const dst = join(ORIG, rel.replace(/[\\/]/g, "__"));
  if (existsSync(src) && !existsSync(dst)) copyFileSync(src, dst);
}

/** Cinematic polish: clarity at native res, resample, micro-sharpen, gentle tone. */
async function render(srcPath, outPath, width, { tone = true, q = 84 } = {}) {
  const meta = await sharp(srcPath).metadata();
  const up = width > (meta.width ?? width);
  let img = sharp(srcPath).rotate();
  // clarity (large-radius unsharp) before resampling so it survives the scale
  img = img.sharpen({ sigma: up ? 2.2 : 1.6, m1: 0.35, m2: 0.9, x1: 2, y2: 10, y3: 20 });
  img = img.resize({ width, kernel: sharp.kernel.lanczos3, withoutEnlargement: false });
  // fine detail after resample
  img = img.sharpen({ sigma: up ? 1.1 : 0.8, m1: 0.5, m2: 1.4, x1: 2, y2: 10, y3: 20 });
  if (tone) {
    img = img
      .modulate({ saturation: 1.05 })
      .linear(1.05, -5); // deeper blacks, a touch more contrast
  }
  await img.jpeg({ quality: q, progressive: true, mozjpeg: true, chromaSubsampling: "4:2:0" }).toFile(outPath);
  const m = await sharp(outPath).metadata();
  const kb = Math.round((await sharp(outPath).toBuffer()).length / 1024);
  console.log(`${outPath.replace(ROOT, "")}  ${m.width}x${m.height}  ${kb}KB`);
}

const jobs = [
  // hero (cross removed)
  { src: join(RET, "hero-still.png"), archive: "hero/hero-still.jpg", out: "hero/hero-still", tiers: { "-4k": 3840, "": 1920, "-m": 1200 } },
  // plates
  { src: join(RET, "show-me.png"), archive: "plates/show-me.jpg", out: "plates/show-me", tiers: { "-4k": 3840, "": 1920, "-m": 1200 } },
  { src: join(PUB, "plates/wtda.jpg"), archive: "plates/wtda.jpg", out: "plates/wtda", tiers: { "-4k": 3840, "": 1920, "-m": 1200 } },
  // covers (show-me cross removed; official art — original archived)
  { src: join(RET, "show-me-cover.png"), archive: "covers/show-me.jpg", out: "covers/show-me", tiers: { "-4k": 4096, "": 2048, "-m": 800 }, tone: false },
  { src: join(PUB, "covers/wtda.jpg"), archive: "covers/wtda.jpg", out: "covers/wtda", tiers: { "-4k": 4096, "": 2048, "-m": 800 }, tone: false },
  // about portrait (png → jpg tiers)
  { src: join(PUB, "about/portrait.png"), archive: "about/portrait.png", out: "about/portrait", tiers: { "-4k": 2560, "": 1600, "-m": 900 } },
  // ASH
  { src: join(PUB, "ash/ash-portrait.jpg"), archive: "ash/ash-portrait.jpg", out: "ash/ash-portrait", tiers: { "": 2048, "-m": 400 } },
  // merch
  ...["show-me-tee", "show-me-hoodie", "wtda-tee", "wtda-hoodie"].map((n) => ({
    src: join(PUB, `merch/${n}.jpg`), archive: `merch/${n}.jpg`, out: `merch/${n}`, tiers: { "": 2048, "-m": 900 },
  })),
];

for (const j of jobs) {
  archive(j.archive);
  // if we're overwriting the very file we read from, read from the archive copy instead
  let src = j.src;
  const archived = join(ORIG, j.archive.replace(/[\\/]/g, "__"));
  if (src.startsWith(PUB) && existsSync(archived)) src = archived;
  for (const [suffix, w] of Object.entries(j.tiers)) {
    await render(src, join(PUB, `${j.out}${suffix}.jpg`), w, { tone: j.tone !== false });
  }
}

// OG share card from the new hero
await render(join(RET, "hero-still.png"), join(PUB, "og.jpg"), 1920, { q: 82 });
await render(join(RET, "hero-still.png"), join(PUB, "og-m.jpg"), 1200, { q: 82 });
console.log("done");

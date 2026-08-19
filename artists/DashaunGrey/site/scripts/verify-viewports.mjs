import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { chromium } from "./_playwright.mjs";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", ".verify");
mkdirSync(out, { recursive: true });

const base = process.env.URL || "http://localhost:3000";
const only = process.argv[2]; // optional: "desktop" | "phone"
const browser = await chromium.launch();

async function page(w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1.5,
    reducedMotion: "no-preference",
    hasTouch: w < 900,
    isMobile: w < 900,
  });
  const p = await ctx.newPage();
  // skip preloader + ash teaser for stable shots
  await p.addInitScript(() => {
    try { sessionStorage.setItem("dg_intro", "1"); sessionStorage.setItem("dg_ash_tease", "1"); } catch {}
  });
  await p.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(600);
  return { p, ctx };
}

async function shotSection(p, sel, name, settle = 900) {
  await p.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 0, behavior: "instant" });
  }, sel);
  await p.waitForTimeout(settle);
  await p.screenshot({ path: join(out, name), fullPage: false });
}

const SECTIONS = [
  ["#top", "hero"],
  ["#music", "music"],
  ["#honors", "honors"],
  ["#wtda", "wtda"],
  ["#album", "album"],
  ["#about", "about"],
  ["#label", "label"],
  ["#merch", "merch"],
  ["#tour", "tour"],
  ["footer", "footer"],
];

if (!only || only === "desktop") {
  const { p, ctx } = await page(1440, 900);
  for (const [sel, name] of SECTIONS) await shotSection(p, sel, `desktop-${name}.png`);
  // scrolled chapter mid-pin
  await p.evaluate(() => window.scrollTo({ top: document.querySelector("#music").getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.9, behavior: "instant" }));
  await p.waitForTimeout(900);
  await p.screenshot({ path: join(out, "desktop-music-pinned.png") });
  // ash open
  await p.click("#ash-orb");
  await p.waitForTimeout(1600);
  await p.screenshot({ path: join(out, "desktop-ash.png") });
  await p.click("#ash-orb");
  // listen menu
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await p.click(".nav-listen > button");
  await p.waitForTimeout(500);
  await p.screenshot({ path: join(out, "desktop-listen.png") });
  await ctx.close();
}

if (!only || only === "phone") {
  const { p, ctx } = await page(390, 844);
  for (const [sel, name] of SECTIONS) await shotSection(p, sel, `phone-${name}.png`);
  await p.click("#ash-orb");
  await p.waitForTimeout(1600);
  await p.screenshot({ path: join(out, "phone-ash.png") });
  await ctx.close();
}

await browser.close();
console.log("shots ok ->", out);

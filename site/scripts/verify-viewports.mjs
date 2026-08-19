/**
 * Screenshot every public page + the admin at desktop and phone sizes.
 *   node scripts/verify-viewports.mjs [desktop|phone] [pathFilter]
 * Requires the dev server (npm run dev → :4990). Output: .verify/*.jpg
 * Playwright is resolved by scripts/_playwright.mjs (local install, PLAYWRIGHT_ROOT, or a sibling checkout).
 */
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { chromium } from "./_playwright.mjs";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", ".verify");
mkdirSync(out, { recursive: true });

const base = process.env.URL || "http://localhost:4990";
const only = process.argv[2];
const filter = process.argv[3];
const PAGES = ["/", "/legacy", "/artists", "/artists/dashaun-grey", "/services", "/releases", "/press", "/submit", "/contact", "/admin/login"];

const browser = await chromium.launch();

async function shoot(label, w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1.25,
    reducedMotion: "no-preference",
    hasTouch: w < 900,
    isMobile: w < 900,
  });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    try {
      sessionStorage.setItem("meg_intro", "1");
    } catch {}
  });
  const errors = [];
  p.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  for (const path of PAGES) {
    if (filter && !(path.includes(filter) || (filter === "home" && path === "/"))) continue;
    await p.goto(base + path, { waitUntil: "networkidle", timeout: 90000 });
    await p.waitForTimeout(500);
    // walk the page so reveal observers fire, then back to top for the fold shot
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.7)) {
      await p.evaluate((yy) => window.scrollTo(0, yy), y);
      await p.waitForTimeout(90);
    }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(2600); // let hero letters finish
    const name = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
    await p.screenshot({ path: join(out, `${label}-${name}-fold.jpg`), quality: 80, type: "jpeg" });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.screenshot({ path: join(out, `${label}-${name}-full.jpg`), fullPage: true, quality: 70, type: "jpeg" });
    console.log(`${label} ${path} ✓ (${total}px)`);
  }
  await ctx.close();
  return errors;
}

let errs = [];
if (!only || only === "desktop") errs = errs.concat(await shoot("desktop", 1440, 900));
if (!only || only === "phone") errs = errs.concat(await shoot("phone", 390, 844));
await browser.close();
if (errs.length) {
  console.log("\n--- page errors ---");
  for (const e of [...new Set(errs)]) console.log(e);
}
console.log("done →", out);

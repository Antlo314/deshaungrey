/**
 * Render the share card (public/media/og.jpg, 1200×630) from an HTML template
 * with the site's own fonts + the traced profile mark. Re-run after any brand
 * change: node scripts/make-og.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { chromium } from "./_playwright.mjs";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const pathTs = readFileSync(join(site, "components", "ProfilePath.ts"), "utf8");
const vb = /PROFILE_VIEWBOX = "([^"]+)"/.exec(pathTs)[1];
const d = /PROFILE_PATH = "([^"]+)"/.exec(pathTs)[1];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Oswald:wght@600&family=Geist:wght@500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#050505;overflow:hidden}
  .card{position:relative;width:1200px;height:630px;background:radial-gradient(ellipse at 78% 50%, rgba(212,179,106,.16), transparent 55%), #050505;color:#ede8dd;font-family:Geist,sans-serif}
  .mark{position:absolute;right:40px;top:50%;transform:translateY(-50%);width:420px;filter:drop-shadow(0 0 40px rgba(212,179,106,.25))}
  .k{position:absolute;left:72px;top:78px;font-size:15px;letter-spacing:.34em;text-transform:uppercase;color:#d4b36a;font-weight:500}
  .k i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#e4111c;margin-right:14px;vertical-align:1px}
  .wm{position:absolute;left:72px;top:126px;display:flex;align-items:center;gap:22px}
  .wm b{font-family:Oswald,sans-serif;font-weight:600;font-size:110px;line-height:.9;letter-spacing:.02em;color:#f7f5f0}
  .wm b i{font-style:normal;color:#e4111c}
  .bar{background:#e4111c;color:#fff;font-family:Oswald,sans-serif;font-weight:600;font-size:22px;letter-spacing:.42em;padding:6px 10px 4px 22px}
  .t{position:absolute;left:72px;top:290px;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:64px;line-height:.98;letter-spacing:-.02em;color:#f7f5f0;max-width:700px}
  .t em{color:#f0dca6}
  .s{position:absolute;left:72px;bottom:104px;font-size:19px;line-height:1.5;color:rgba(237,232,221,.72);max-width:640px}
  .u{position:absolute;left:72px;bottom:62px;font-size:15px;letter-spacing:.3em;text-transform:uppercase;color:#d4b36a}
  .line{position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(115deg,#8f7440,#d4b36a 30%,#f5e3b8 50%,#d4b36a 70%,#8f7440)}
</style></head><body>
<div class="card">
  <svg class="mark" viewBox="${vb}" fill="#E8C778" fill-rule="evenodd"><path d="${d}"/></svg>
  <div class="k"><i></i>MEG Enterprises, LLC · Independent record label</div>
  <div class="wm"><b>M<i>.</i>E<i>.</i>G</b><div class="bar">ENTERPRISES</div></div>
  <div class="t">Independent music. Developing artists. Building brands. <em>Creating legacy.</em></div>
  <div class="s">A family-founded independent label with three decades in music, artist development, management and promotion.</div>
  <div class="u">megentllc.com</div>
  <div class="line"></div>
</div></body></html>`;

const tmp = join(site, ".verify", "og.html");
mkdirSync(dirname(tmp), { recursive: true });
writeFileSync(tmp, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
mkdirSync(join(site, "public", "media"), { recursive: true });
await page.screenshot({ path: join(site, "public", "media", "og.jpg"), type: "jpeg", quality: 90 });
await browser.close();
console.log("wrote public/media/og.jpg");

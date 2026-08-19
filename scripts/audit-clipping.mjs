/**
 * Find text whose real glyph ink is painted outside its own box.
 *
 * Two causes bite this design:
 *   - `background-clip:text` (.metal-text) paints ONLY inside the element box
 *   - `overflow:hidden` on the letter-reveal masks (.st, .menu-links a)
 * ...and both are combined with display line-heights below 1, which leave
 * descenders outside the box.
 *
 * Ink is measured with canvas TextMetrics.actualBoundingBox*, NOT the font's
 * ascent/descent metrics — the latter reports ~0.2em of empty space above every
 * capital and produces false positives.
 *
 * Run against a dev server:  node scripts/audit-clipping.mjs
 */
import { chromium } from "./_playwright.mjs";
import { mkdirSync } from "fs";

const base = process.env.URL || "http://localhost:4990";
const PAGES = ["/", "/legacy", "/artists", "/artists/dashaun-grey", "/services", "/releases", "/press", "/submit", "/contact"];
mkdirSync(".verify", { recursive: true });
const browser = await chromium.launch();

const MEASURE = () => {
  const out = [];
  const cv = document.createElement("canvas");
  const ctx = cv.getContext("2d");
  const isClip = (cs) => cs.overflowY !== "visible" || cs.overflow !== "visible";
  const isBgText = (cs) => cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim();
    if (!text) continue;
    const parent = n.parentElement;
    if (!parent) continue;
    const pcs = getComputedStyle(parent);
    if (pcs.display === "none" || pcs.visibility === "hidden" || pcs.opacity === "0") continue;

    // Skip anything the user cannot currently see: decorative watermarks marked
    // aria-hidden, and panels parked at opacity 0 (the closed menu, whose letters
    // sit below their mask on purpose until it opens).
    let hidden = false;
    for (let e = parent; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (e.getAttribute("aria-hidden") === "true" || cs.opacity === "0" || cs.visibility === "hidden") { hidden = true; break; }
    }
    if (hidden) continue;

    // the box that limits painting
    let limiter = null, why = "";
    for (let e = parent; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (isBgText(cs)) { limiter = e; why = "background-clip:text"; break; }
      if (isClip(cs)) { limiter = e; why = "overflow"; break; }
    }
    if (!limiter) continue;
    const lcs = getComputedStyle(limiter);
    if (lcs.position === "absolute" && lcs.clip !== "auto") continue;          // .sr helper
    if (limiter.getAttribute("aria-hidden") === "true") continue;              // decorative watermarks

    const rects = [...(() => { const r = document.createRange(); r.selectNodeContents(n); return r.getClientRects(); })()];
    if (!rects.length) continue;

    // real ink relative to the baseline of each line box
    ctx.font = pcs.font && pcs.font !== "" ? pcs.font : `${pcs.fontStyle} ${pcs.fontWeight} ${pcs.fontSize} ${pcs.fontFamily}`;
    const m = ctx.measureText(text);
    const fAsc = m.fontBoundingBoxAscent, fDesc = m.fontBoundingBoxDescent;
    const iAsc = m.actualBoundingBoxAscent, iDesc = m.actualBoundingBoxDescent;
    if (![fAsc, fDesc, iAsc, iDesc].every(Number.isFinite)) continue;

    const box = limiter.getBoundingClientRect();
    let worstBottom = -Infinity, worstTop = -Infinity;
    for (const rect of rects) {
      const halfLeading = (rect.height - (fAsc + fDesc)) / 2;
      const baseline = rect.top + halfLeading + fAsc;
      worstBottom = Math.max(worstBottom, baseline + iDesc - box.bottom);
      worstTop = Math.max(worstTop, box.top - (baseline - iAsc));
    }
    if (worstBottom <= 0.5 && worstTop <= 0.5) continue;

    const key = `${limiter.className}|${text.slice(0, 18)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      cls: (limiter.className || "").toString().slice(0, 26) || limiter.tagName.toLowerCase(),
      text: text.slice(0, 22),
      fs: Math.round(parseFloat(pcs.fontSize)),
      lh: (parseFloat(pcs.lineHeight) / parseFloat(pcs.fontSize)).toFixed(2),
      bottom: +worstBottom.toFixed(1),
      top: +worstTop.toFixed(1),
      why,
    });
  }
  return out;
};

async function run(w, h, label) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 900, hasTouch: w < 900 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { sessionStorage.setItem("meg_intro", "1"); } catch {} });
  const rows = [];
  for (const path of PAGES) {
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 90000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.7)) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    for (const r of await page.evaluate(MEASURE)) rows.push({ vp: label, path, ...r });
  }
  await ctx.close();
  return rows;
}

const rows = [...(await run(1440, 900, "desktop")), ...(await run(390, 844, "phone"))];
await browser.close();

if (!rows.length) { console.log("✓ no clipped glyph ink anywhere"); process.exit(0); }
console.log(`${rows.length} clipped text element(s):\n`);
console.log("vp".padEnd(8), "class".padEnd(24), "text".padEnd(24), "fs".padEnd(5), "lh".padEnd(6), "outBottom".padEnd(10), "outTop".padEnd(8), "why");
console.log("-".repeat(110));
for (const r of rows.sort((a, b) => Math.max(b.bottom, b.top) - Math.max(a.bottom, a.top)))
  console.log(r.vp.padEnd(8), r.cls.padEnd(24), JSON.stringify(r.text).slice(0, 24).padEnd(24), String(r.fs).padEnd(5), r.lh.padEnd(6), String(r.bottom).padEnd(10), String(r.top).padEnd(8), r.why, r.path);
process.exit(1);

/** Zoomed screenshots of specific selectors. node scripts/shot-region.mjs <path> <selector> <outname> */
import { chromium } from "./_playwright.mjs";
import { mkdirSync } from "fs";
const [path, selector, name] = process.argv.slice(2);
const base = process.env.URL || "http://localhost:4990";
mkdirSync(".verify", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => { try { sessionStorage.setItem("meg_intro", "1"); } catch {} });
await page.goto(base + path, { waitUntil: "networkidle", timeout: 90000 });
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2500);
const el = page.locator(selector).first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await el.screenshot({ path: `.verify/${name}.png` });
console.log("wrote .verify/" + name + ".png");
await browser.close();

import { createRequire } from "module";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire("C:/Users/aarons/Desktop/zion-agent/package.json");
const { chromium } = require("playwright");

const out = join(dirname(fileURLToPath(import.meta.url)), "..", ".verify");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

async function shot(w, h, name, extra) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });
  if (extra) await extra(page);
  await page.screenshot({ path: join(out, name), fullPage: false });
  await page.close();
}

await shot(1440, 900, "desktop-hero.png");
await shot(390, 844, "phone-hero.png");
await shot(390, 844, "phone-music.png", async (p) => {
  await p.locator("#music").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
});
await shot(390, 844, "phone-merch.png", async (p) => {
  await p.locator("#merch").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
});
await shot(390, 844, "phone-about.png", async (p) => {
  await p.locator("#about").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
});
await browser.close();
console.log("shots ok");

/**
 * End-to-end smoke of the owner dashboard against a running dev server.
 *   node scripts/e2e-admin.mjs
 * Creates the first owner (dev mode, no setup token), signs in, creates a post,
 * sends a public inquiry + submission, handles them, saves settings, and
 * screenshots every admin screen at desktop + phone into .verify/.
 * Idempotent-ish: if an owner already exists it signs in with the same creds.
 */
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { chromium } from "./_playwright.mjs";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", ".verify");
mkdirSync(out, { recursive: true });
const base = process.env.URL || "http://localhost:4990";
// Local smoke-test account only. Override with E2E_OWNER_* to point at another
// environment; never reuse these values for a real deployed owner.
const OWNER = {
  name: process.env.E2E_OWNER_NAME || "E2E Owner",
  email: process.env.E2E_OWNER_EMAIL || "e2e-owner@example.test",
  password: process.env.E2E_OWNER_PASSWORD || "local-smoke-test-pw-1",
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.25 });
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept()); // confirm() on delete buttons
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(`console: ${m.text()}`));
const shot = (name) => page.screenshot({ path: join(out, `admin-${name}.jpg`), quality: 80, type: "jpeg", fullPage: true });
const step = (s) => console.log("•", s);

// 1. proxy gate
await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
if (!page.url().includes("/admin/login")) throw new Error(`expected redirect to login, got ${page.url()}`);
step("gate → login ✓");
await shot("login");

// 2. setup (if no owner) else login
await page.goto(`${base}/admin/setup`, { waitUntil: "networkidle" });
const setupOpen = await page.locator('input[name="password"]').count();
if (setupOpen) {
  await page.fill('input[name="name"]', OWNER.name);
  await page.fill('input[name="email"]', OWNER.email);
  await page.fill('input[name="password"]', OWNER.password);
  await page.fill('input[name="confirm"]', OWNER.password);
  await Promise.all([page.waitForURL(/\/admin$/, { timeout: 30000 }), page.click('button[type="submit"]')]);
  step("first owner created ✓");
} else {
  await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', OWNER.email);
  await page.fill('input[name="password"]', OWNER.password);
  await Promise.all([page.waitForURL(/\/admin$/, { timeout: 30000 }), page.click('button[type="submit"]')]);
  step("signed in ✓");
}
await page.waitForLoadState("networkidle");
await shot("dashboard");

// 3. wrong password is rejected (fresh context)
{
  const c2 = await browser.newContext();
  const p2 = await c2.newPage();
  await p2.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
  await p2.fill('input[name="email"]', OWNER.email);
  await p2.fill('input[name="password"]', "wrong-password-1");
  await p2.click('button[type="submit"]');
  await p2.waitForSelector(".msg.err", { timeout: 15000 });
  if (!p2.url().includes("/admin/login")) throw new Error("bad password was accepted");
  step("bad password rejected ✓");
  await c2.close();
}

// 4. create a post
await page.goto(`${base}/admin/press/new`, { waitUntil: "networkidle" });
await page.fill('input[name="title"]', "E2E — test announcement");
await page.fill('textarea[name="excerpt"]', "Created by the smoke test.");
await page.fill('textarea[name="body"]', "First paragraph.\n\n## A heading\n\nSecond paragraph.");
await page.check('input[name="published"]');
await Promise.all([page.waitForURL(/\/admin\/press\?saved=/, { timeout: 30000 }), page.click('form.f button[type="submit"]')]);
step("post created ✓");
await shot("press-list");
const pub = await ctx.newPage();
await pub.goto(`${base}/press/e2e-test-announcement`, { waitUntil: "networkidle" });
if (!(await pub.locator("h1").textContent())?.includes("E2E")) throw new Error("post not public");
step("post visible publicly ✓");

// 5. public inquiry
await pub.goto(`${base}/contact?kind=booking`, { waitUntil: "networkidle" });
await pub.fill("#name", "Test Booker");
await pub.fill("#email", "booker@example.com");
await pub.fill("#company", "Example Venue");
await pub.fill("#message", "We would love to book Dashaun Grey for a private event in October. Budget flexible.");
await pub.click('button[type="submit"]');
await pub.waitForSelector(".form-done", { timeout: 20000 });
step("inquiry submitted ✓");
await pub.screenshot({ path: join(out, "public-contact-done.jpg"), quality: 80, type: "jpeg" });

// 6. public submission
await pub.goto(`${base}/submit`, { waitUntil: "networkidle" });
await pub.fill("#artistName", "Test Artist");
await pub.fill("#sname", "Tess T. Artist");
await pub.fill("#semail", "artist@example.com");
await pub.fill("#city", "Columbia, SC");
await pub.click('button.chip:has-text("R&B")');
await pub.fill('input[aria-label="Link 1"]', "open.spotify.com/track/example");
await pub.click('button[type="submit"]');
await pub.waitForSelector(".form-done", { timeout: 20000 });
step("submission submitted ✓");

// 7. inbox shows it, handle it
await page.goto(`${base}/admin/inbox`, { waitUntil: "networkidle" });
if (!(await page.locator("text=Test Booker").count())) throw new Error("inquiry missing from inbox");
await shot("inbox");
await page.click("text=Test Booker");
await page.waitForURL(/\/admin\/inbox\//);
await page.selectOption('select[name="status"]', "replied");
await page.fill('textarea[name="notes"]', "Replied with rate card.");
await page.click('form.f button[type="submit"]');
await page.waitForSelector(".msg", { timeout: 15000 });
step("inquiry handled ✓");
await shot("inbox-detail");

await page.goto(`${base}/admin/submissions`, { waitUntil: "networkidle" });
if (!(await page.locator("text=Test Artist").count())) throw new Error("submission missing");
await shot("submissions");
await page.click("text=Test Artist");
await page.waitForURL(/\/admin\/submissions\//);
await page.click('.stars button[aria-label="4 stars"]');
await page.selectOption('select[name="status"]', "shortlisted");
await page.click('form.f button[type="submit"]');
await page.waitForSelector(".msg", { timeout: 15000 });
step("submission rated ✓");
await shot("submission-detail");

// 8. settings → contact email shows in footer
await page.goto(`${base}/admin/settings`, { waitUntil: "networkidle" });
await page.fill('input[name="contactEmail"]', "services@megentllc.com");
await page.fill('input[name="announcement"]', "E2E announcement bar");
await page.click('form.f button[type="submit"]:has-text("Save settings")');
await page.waitForSelector(".msg", { timeout: 15000 });
step("settings saved ✓");
await shot("settings");
await pub.goto(`${base}/`, { waitUntil: "networkidle" });
if (!(await pub.locator("text=services@megentllc.com").count())) throw new Error("contact email not on public site");
if (!(await pub.locator(".announce").count())) throw new Error("announcement bar missing");
step("settings reflected publicly ✓");
// clear announcement so the site is clean afterwards
await page.goto(`${base}/admin/settings`, { waitUntil: "networkidle" });
await page.fill('input[name="announcement"]', "");
await page.click('form.f button[type="submit"]:has-text("Save settings")');
await page.waitForSelector(".msg", { timeout: 15000 });

// 9. remaining screens
for (const p of ["roster", "roster/art_dashaun_grey", "releases", "releases/new", "events", "events/new", "team", "press/new"]) {
  await page.goto(`${base}/admin/${p}`, { waitUntil: "networkidle" });
  await shot(p.replace(/\//g, "-"));
}
step("screens captured ✓");

// 10. phone dashboard
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await m.newPage();
await mp.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
await mp.fill('input[name="email"]', OWNER.email);
await mp.fill('input[name="password"]', OWNER.password);
await Promise.all([mp.waitForURL(/\/admin$/, { timeout: 30000 }), mp.click('button[type="submit"]')]);
await mp.screenshot({ path: join(out, "admin-phone-dashboard.jpg"), quality: 80, type: "jpeg", fullPage: true });
await mp.click(".adm-menu-btn");
await mp.waitForTimeout(500);
await mp.screenshot({ path: join(out, "admin-phone-menu.jpg"), quality: 80, type: "jpeg" });
await m.close();

// 10b. clean up the rows this test created (owner deletes)
await page.goto(`${base}/admin/press`, { waitUntil: "networkidle" });
await page.click("text=E2E — test announcement");
await page.waitForURL(/\/admin\/press\//);
await Promise.all([page.waitForURL(/\/admin\/press$/), page.click('button.abtn.danger')]);
await page.goto(`${base}/admin/inbox?status=all`, { waitUntil: "networkidle" });
await page.click("text=Test Booker");
await page.waitForURL(/\/admin\/inbox\//);
await Promise.all([page.waitForURL(/\/admin\/inbox$/), page.click('button.abtn.danger')]);
await page.goto(`${base}/admin/submissions?status=all`, { waitUntil: "networkidle" });
await page.click("text=Test Artist");
await page.waitForURL(/\/admin\/submissions\//);
await Promise.all([page.waitForURL(/\/admin\/submissions$/), page.click('button.abtn.danger')]);
step("test rows cleaned up ✓");

// 11. sign out
await page.evaluate(() => document.querySelector('.adm-side form').requestSubmit());
await page.waitForURL(/\/admin\/login/);
await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
if (!page.url().includes("/admin/login")) throw new Error("still signed in after logout");
step("sign out ✓");

await browser.close();
if (errors.length) {
  console.log("\n--- page errors ---");
  for (const e of [...new Set(errors)]) console.log(e);
}
console.log("ALL GOOD →", out);

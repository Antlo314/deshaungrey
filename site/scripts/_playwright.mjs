import { createRequire } from "module";

/**
 * Resolve Playwright without pinning anyone's machine path into the repo.
 *
 * Order:
 *   1. this repo's own node_modules  (npm i -D playwright)
 *   2. PLAYWRIGHT_ROOT — path to a package.json (or any file) next to a node_modules that has it
 *   3. a sibling zion-agent checkout on this workstation, derived from the OS home dir
 *      so no username is hardcoded in a published file
 *
 * Screenshot/e2e scripts are dev-only, so Playwright is deliberately NOT a
 * dependency of this project — it is a ~300 MB install nobody needs to deploy.
 */
const BASES = [
  import.meta.url,
  process.env.PLAYWRIGHT_ROOT,
  (process.env.USERPROFILE || process.env.HOME) && `${(process.env.USERPROFILE || process.env.HOME).replace(/\\/g, "/")}/Desktop/zion-agent/package.json`,
].filter(Boolean);

export function loadPlaywright() {
  const tried = [];
  for (const base of BASES) {
    try {
      return createRequire(base)("playwright");
    } catch (e) {
      tried.push(`  ${base} → ${e.code || e.message}`);
    }
  }
  throw new Error(
    "Playwright not found. Either install it here:\n" +
      "  npm i -D playwright && npx playwright install chromium\n" +
      "or point PLAYWRIGHT_ROOT at a package.json beside a node_modules that has it.\n" +
      "Tried:\n" +
      tried.join("\n")
  );
}

export const chromium = loadPlaywright().chromium;

/**
 * web-clone / capture.ts — bulk recon harvester (runs on Node via tsx + Playwright).
 *
 * Usage (from repo root, after Phase 0 installs):
 *   npx tsx .claude/skills/web-clone/scripts/capture.ts                    # capture all routes
 *   npx tsx .claude/skills/web-clone/scripts/capture.ts --download-assets  # fetch assets to public/clone-assets
 *
 * Reads : _webclone/captures/routes.json  (create in Phase 1 — schema below)
 * Writes: _webclone/captures/{slug}/{viewport}.png|.html|.txt
 *         _webclone/captures/assets-manifest.json
 *         public/clone-assets/**            (only with --download-assets)
 *
 * Credentials come from .env (CLONE_LOGIN_PHONE / CLONE_LOGIN_PASSWORD) and are
 * NEVER printed, logged, or written to any output file.
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { chromium } from "playwright";

// ---------------------------------------------------------------------------
// CONFIG — verify against the real site during Phase 1 exploration, then edit.
// These selectors are the ONLY Flyer-specific part of this script.
// ---------------------------------------------------------------------------
const LOGIN = {
  path: "/login",
  phoneInput: 'input[name="identifier"]', // VERIFY
  passwordInput: 'input[type="password"]', // VERIFY
  submitButton: 'button[type="submit"]', // VERIFY
} as const;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const OUT_DIR = "_webclone/captures";
const ASSETS_DIR = "public/clone-assets";

type RouteEntry = {
  slug: string; // filesystem-safe id, e.g. "home", "practice-list"
  path: string; // route path, e.g. "/" or "/practice"
  auth?: boolean; // requires login session
  type?: "static" | "form" | "player"; // players are captured but built in v1.1
};

const TARGET = process.env.CLONE_TARGET_URL;
const PHONE = process.env.CLONE_LOGIN_PHONE;
const PASSWORD = process.env.CLONE_LOGIN_PASSWORD;

if (!TARGET) {
  console.error("Missing CLONE_TARGET_URL in .env — see references/phase-0-setup.md");
  process.exit(1);
}

const downloadAssets = process.argv.includes("--download-assets");
const routesFile = process.argv.find((a) => a.startsWith("--routes="))?.slice(9) ?? join(OUT_DIR, "routes.json");

// ---------------------------------------------------------------------------
async function loadRoutes(): Promise<RouteEntry[]> {
  const raw = JSON.parse(await readFile(routesFile, "utf8")) as RouteEntry[];
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(`${routesFile} is empty — fill it during Phase 1 (schema: { slug, path, auth?, type? }[])`);
  }
  return raw;
}

async function loginOnce(page: import("playwright").Page): Promise<void> {
  if (!PHONE || !PASSWORD) {
    console.log("No CLONE_LOGIN_PHONE/PASSWORD — capturing public routes only.");
    return;
  }
  await page.goto(new URL(LOGIN.path, TARGET).toString(), { waitUntil: "load" });
  await page.fill(LOGIN.phoneInput, PHONE);
  await page.fill(LOGIN.passwordInput, PASSWORD);
  await page.click(LOGIN.submitButton);
  await page.waitForTimeout(3000);
  // Session persists in the browser context; credentials are never output.
}

/** Scroll to the bottom in steps to trigger lazy/reveal content, then back to top. */
async function settle(page: import("playwright").Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let total = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        total += distance;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 150);
    });
  });
  await page.waitForTimeout(600); // let reveal animations and lazy images land
}

async function collectAssetUrls(page: import("playwright").Page): Promise<string[]> {
  return page.evaluate(() => {
    const urls = new Set<string>();
    document.querySelectorAll("img[src]").forEach((el) => urls.add((el as HTMLImageElement).src));
    document
      .querySelectorAll("link[rel='stylesheet'][href], link[rel='icon'][href]")
      .forEach((el) => urls.add((el as HTMLLinkElement).href));
    return [...urls];
  });
}

function sanitizeAssetUrl(url: string): string {
  const u = new URL(url);
  const safe = u.pathname.replace(/[^a-zA-Z0-9._/-]/g, "_").replace(/^\/+/, "");
  return safe || `root-${u.hostname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
}

// ---------------------------------------------------------------------------
async function main() {
  const routes = await loadRoutes();
  const failures: string[] = [];

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const assetUrls = new Set<string>();
    const authNeeded = routes.some((r) => r.auth);
    if (authNeeded) await loginOnce(page);

    for (const route of routes) {
      const url = new URL(route.path, TARGET).toString();
      for (const vp of VIEWPORTS) {
        const dir = join(OUT_DIR, route.slug);
        try {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(url, { waitUntil: "load", timeout: 45_000 });
          await settle(page);

          await mkdir(dir, { recursive: true });
          await page.screenshot({ path: join(dir, `${vp.name}.png`), fullPage: true });
          const html = await page.content();
          await writeFile(join(dir, `${vp.name}.html`), html, "utf8");
          const text = await page.evaluate(() => document.body.innerText);
          await writeFile(join(dir, `${vp.name}.txt`), text, "utf8");

          if (vp.name === "desktop") collectAssetUrls(page).then((u) => u.forEach((x) => assetUrls.add(x)));
          console.log(`  ok  ${route.slug} [${vp.name}]${route.type === "player" ? " (player — build deferred v1.1)" : ""}`);
        } catch (err) {
          failures.push(`${route.slug} [${vp.name}]: ${err instanceof Error ? err.message : String(err)}`);
          console.error(`FAIL  ${route.slug} [${vp.name}] — ${failures.at(-1)}`);
        }
      }
    }

    await writeFile(join(OUT_DIR, "assets-manifest.json"), JSON.stringify([...assetUrls], null, 2), "utf8");

    if (downloadAssets) {
      const manifest = [...assetUrls];
      for (const url of manifest) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = Buffer.from(await res.arrayBuffer());
          const dest = normalize(join(ASSETS_DIR, sanitizeAssetUrl(url)));
          await mkdir(dirname(dest), { recursive: true });
          await writeFile(dest, buf);
        } catch (err) {
          console.error(`ASSET FAIL ${url} — ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      console.log(`Assets → ${ASSETS_DIR} (${manifest.length} attempted)`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nCaptured ${routes.length} route(s) × ${VIEWPORTS.length} viewport(s). ${failures.length} failure(s).`);
  if (failures.length > 0) {
    console.error("Failures:\n" + failures.join("\n"));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

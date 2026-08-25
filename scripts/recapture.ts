import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { chromium, Page } from "playwright";

const TARGET = process.env.CLONE_TARGET_URL || "https://exam.flyer.us";
const OUT_DIR = join(process.cwd(), "_webclone/captures");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  // { name: "tablet", width: 768, height: 1024 },
  // { name: "mobile", width: 390, height: 844 },
];

async function settle(page: Page) {
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
}

async function loginOnce(page: Page) {
  // Load credentials from git-ignored .env — never hardcode them in source
  try {
    process.loadEnvFile?.();
  } catch {
    // .env missing — rely on process.env already set
  }

  const phone = process.env.CLONE_LOGIN_PHONE;
  const password = process.env.CLONE_LOGIN_PASSWORD;
  if (!phone || !password) {
    throw new Error(
      "Missing CLONE_LOGIN_PHONE / CLONE_LOGIN_PASSWORD in .env — cannot log in to capture authed screens",
    );
  }

  console.log("Logging in...");
  await page.goto(`${TARGET}/login`, { waitUntil: "load" });
  await page.fill('input[name="identifier"]', phone);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle", { timeout: 15_000 });
  await page.waitForTimeout(2000);
  console.log("Login successful.");

  // Dismiss onboarding if present
  try {
    const onboardingBtn = page.locator('button:has-text("Đi thôi!")');
    if (await onboardingBtn.isVisible({ timeout: 5000 })) {
      console.log("Dismissing onboarding...");
      await onboardingBtn.click();
      await page.waitForTimeout(2000); // wait for modal to animate out
    }
  } catch (err) {
    console.log("No onboarding modal found.");
  }
}

async function main() {
  const routes = [
    { slug: "dashboard", path: "/", auth: true },
    { slug: "history", path: "/history", auth: true },
    { slug: "ranking", path: "/ranking", auth: true },
  ];

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginOnce(page);

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

          console.log(`  ok  ${route.slug} [${vp.name}]`);
        } catch (err) {
          console.error(`FAIL  ${route.slug} [${vp.name}] — ${err}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

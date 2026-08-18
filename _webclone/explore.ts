import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to login...");
  await page.goto("https://exam.flyer.us/login", { waitUntil: "networkidle" });
  
  console.log("Filling credentials...");
  await page.fill('input[name="identifier"]', process.env.CLONE_LOGIN_PHONE || "0932720343");
  await page.fill('input[type="password"]', process.env.CLONE_LOGIN_PASSWORD || "Phuc2006");
  
  await page.click('button[type="submit"]');
  
  console.log("Waiting for network idle after login...");
  await page.waitForTimeout(3000); // wait a bit just in case networkidle triggers too early
  
  await page.screenshot({ path: "_webclone/login-debug.png" });

  const url = page.url();
  console.log("Current URL after login:", url);

  await browser.close();
}

main().catch(console.error);


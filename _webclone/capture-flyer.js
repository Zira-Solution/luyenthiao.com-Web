import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "captures_exam");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const capturedNetwork = [];
  
  context.on("response", async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()["content-type"] || "";
      
      if (url.includes("flyer.us") || url.includes("flyer") || contentType.includes("json")) {
        if (contentType.includes("application/json")) {
          const text = await response.text();
          capturedNetwork.push({
            url,
            type: "json",
            content: JSON.parse(text)
          });
          console.log(`[JSON Captured] ${url}`);
        } else if (contentType.includes("audio") || url.includes(".mp3")) {
          capturedNetwork.push({ url, type: "audio" });
          console.log(`[Audio Captured] ${url}`);
        } else if (contentType.includes("image")) {
          capturedNetwork.push({ url, type: "image" });
        }
      }
    } catch (e) {
      // Ignore errors
    }
  });

  const page = await context.newPage();
  
  let stateCounter = 0;
  async function captureState(name) {
    stateCounter++;
    const stateName = `${stateCounter.toString().padStart(2, "0")}_${name}`;
    console.log(`Capturing state: ${stateName}...`);
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${stateName}.png`),
      fullPage: true
    });
    
    const html = await page.content();
    fs.writeFileSync(path.join(OUTPUT_DIR, `${stateName}.html`), html);
    
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        buttons: Array.from(document.querySelectorAll("button")).map(b => b.innerText.trim()).filter(Boolean),
        headings: Array.from(document.querySelectorAll("h1, h2, h3, h4")).map(h => h.innerText.trim()).filter(Boolean),
      };
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, `${stateName}.json`), JSON.stringify(pageInfo, null, 2));
  }

  try {
    const targetUrl = "https://exam.flyer.us/check-point/7778495e-531b-4039-a3ea-321874ba1a7a";
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
    
    // Wait for selector to ensure the page has loaded its JS
    console.log("Waiting for main content to load...");
    await page.waitForTimeout(5000);
    
    // State 1: Intro / Select Mode screen
    await captureState("intro");

    // Click "Bắt đầu" button
    console.log("Looking for Bắt đầu button...");
    const batDauBtn = page.locator("button:has-text('Bắt đầu'), [class*='Button']:has-text('Bắt đầu'), div:has-text('Bắt đầu')").last();
    await batDauBtn.click();
    console.log("Clicked Bắt đầu!");
    
    await page.waitForTimeout(5000);

    // State 2: Listening Part 1
    await captureState("listening_p1_drag_name");

    // Click next button function
    async function clickNext() {
      console.log("Clicking next button...");
      const clicked = await page.evaluate(() => {
        // Find buttons containing icons or words like "tiếp"
        const btns = Array.from(document.querySelectorAll("button, div[role='button'], span[role='button']"));
        for (const btn of btns) {
          const html = btn.innerHTML.toLowerCase();
          const text = btn.innerText.toLowerCase();
          
          // Next button detection
          if (html.includes("arrow-right") || html.includes("right-arrow") || html.includes("next") || text.includes("tiếp theo") || text.includes("câu sau")) {
            btn.click();
            return true;
          }
        }
        
        // Try SVG detection
        const svgs = Array.from(document.querySelectorAll("svg"));
        for (const svg of svgs) {
          const html = svg.innerHTML.toLowerCase();
          if (html.includes("right") || html.includes("next")) {
            const clickable = svg.closest("button") || svg.closest("div[role='button']") || svg;
            clickable.click();
            return true;
          }
        }
        return false;
      });

      if (clicked) {
        console.log("Next button clicked successfully");
      } else {
        console.log("Could not find next button via custom click, trying keyboard ArrowRight...");
        await page.keyboard.press("ArrowRight");
      }
      await page.waitForTimeout(5000);
    }

    // Step 3: Go to Listening Part 2 (Nghe và nhập từ khoá)
    await clickNext();
    await captureState("listening_p2_keyword");

    // Step 4: Go to Listening Part 3 (Nghe và chọn ảnh tương ứng)
    await clickNext();
    await captureState("listening_p3_image_abcd");

    // Step 5: Go to Listening Part 4 (Nghe và chọn ảnh đúng như trắc nghiệm)
    await clickNext();
    await captureState("listening_p4_multiple_choice_image");

    // Step 6: Go to Listening Part 5 (Kéo thả tên tương ứng)
    await clickNext();
    await captureState("listening_p5_drag_name_2");

    // Step 7: Click next to trigger warning dialog
    await clickNext();
    await captureState("modal_listening_complete");

    // Step 8: Click "Làm tiếp"
    console.log("Looking for 'Làm tiếp' button...");
    const lamTiepBtn = page.locator("button:has-text('Làm tiếp'), button:has-text('Tiếp tục'), div:has-text('Làm tiếp')").first();
    await lamTiepBtn.click();
    await page.waitForTimeout(5000);
    
    // State 9: Reading & Writing Part 1
    await captureState("rw_p1_fill_words");

    // Step 10: Go to Reading & Writing Part 2 (Trắc nghiệm)
    await clickNext();
    await captureState("rw_p2_multiple_choice");

    // Step 11: Go to Reading & Writing Part 3 (Điền từ)
    await clickNext();
    await captureState("rw_p3_fill_words");

    // Step 12: Go to Reading & Writing Part 4 (Điền từ)
    await clickNext();
    await captureState("rw_p4_fill_words");

    // Step 13: Go to Reading & Writing Part 5 (Điền từ)
    await clickNext();
    await captureState("rw_p5_fill_words");

    // Step 14: Go to Reading & Writing Part 6 (Điền từ)
    await clickNext();
    await captureState("rw_p6_fill_words");

    // Step 15: Click next to trigger submit warning dialog
    await clickNext();
    await captureState("modal_rw_complete");

    // Step 16: Click "Nộp bài"
    console.log("Looking for 'Nộp bài' button...");
    const nopBaiBtn = page.locator("button:has-text('Nộp bài'), button:has-text('Xác nhận'), div:has-text('Nộp bài')").first();
    await nopBaiBtn.click();
    
    // Wait for loading screen
    console.log("Waiting for submit loading...");
    await page.waitForTimeout(8000);
    await captureState("loading_results");

    // Step 17: Results page /testresult
    console.log("Waiting for testresult URL...");
    await page.waitForURL("**/testresult**", { timeout: 25000 }).catch(e => console.log("Timeout waiting for /testresult. URL is:", page.url()));
    await captureState("result_page");

  } catch (error) {
    console.error("Error occurred during automation:", error);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "error_screenshot.png"), fullPage: true });
  } finally {
    fs.writeFileSync(path.join(OUTPUT_DIR, "network_log.json"), JSON.stringify(capturedNetwork, null, 2));
    console.log("Closing browser...");
    await browser.close();
    console.log("Automation completed.");
  }
}

run();

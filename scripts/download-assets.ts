import { createWriteStream, mkdirSync, readFileSync } from "fs";
import https from "https";
import { join } from "path";

import * as cheerio from "cheerio";

const html = readFileSync(join(process.cwd(), "_webclone/captures/dashboard/desktop.html"), "utf8");
const $ = cheerio.load(html);

const outDir = join(process.cwd(), "public", "clone-assets", "media");
mkdirSync(outDir, { recursive: true });

const images = new Set<string>();

$('img').each((_, el) => {
  const src = $(el).attr('src');
  if (src && src.includes('_next/image?url=')) {
    // extract the actual url
    const urlParam = new URL("https://exam.flyer.us" + src).searchParams.get("url");
    if (urlParam) {
      images.add(urlParam);
    }
  }
});

console.log(`Found ${images.size} images to download`);

images.forEach((urlPath) => {
  // urlPath looks like /_next/static/media/bg-home.72e8fdd5.jpg
  const fileName = urlPath.split('/').pop() || "unknown.png";
  const targetUrl = `https://exam.flyer.us${urlPath}`;
  
  const targetPath = join(outDir, fileName);
  
  https.get(targetUrl, (res) => {
    if (res.statusCode === 200) {
      const fileStream = createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        console.log(`Downloaded ${fileName}`);
      });
    } else {
      console.log(`Failed to download ${fileName}: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${fileName}:`, err.message);
  });
});

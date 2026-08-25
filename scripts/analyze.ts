import { readFileSync } from "fs";
import { join } from "path";

import * as cheerio from "cheerio";
import { Element } from "domhandler";

const html = readFileSync(join(process.cwd(), "_webclone/captures/dashboard/desktop.html"), "utf8");
const $ = cheerio.load(html);

// Find elements with text "Xếp hạng"
$('*:contains("Xếp hạng")').each((_, el) => {
  // Only get the closest anchor or meaningful parent
  if ($(el).is('a') || $(el).is('span') || $(el).is('button')) {
    const elName = el instanceof Element ? el.tagName : $(el).prop("tagName");
    console.log(`Found text "${$(el).text()}" in <${elName}>`);
    console.log("Classes:", $(el).attr('class'));
    
    // get parent classes
    console.log("Parent classes:", $(el).parent().attr('class'));
    console.log("-------------------");
  }
});

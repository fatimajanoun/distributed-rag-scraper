import * as cheerio from "cheerio";
import { chromium } from "playwright";

import type { ScrapedPage } from "./scrapeStaticPage.js";

export async function scrapeDynamicPage(
  url: string,
): Promise<ScrapedPage> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    // Give JavaScript a little time to render the page content.
    await page.waitForTimeout(2_000);

    const rawHtml = await page.content();
    const finalUrl = page.url();
    const statusCode = response?.status() ?? 200;

    const $ = cheerio.load(rawHtml);

    const title = $("title").text().trim();

    // Remove elements that usually add noise.
    $("script, style, noscript").remove();

    const text = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const links = $("a[href]")
      .map((_, element) => {
        const href = $(element).attr("href");

        if (!href) {
          return null;
        }

        try {
          return new URL(href, finalUrl).toString();
        } catch {
          return null;
        }
      })
      .get()
      .filter((link): link is string => Boolean(link));

    return {
      url: finalUrl,
      title,
      text,
      rawHtml,
      statusCode,
      links: [...new Set(links)],
    };
  } finally {
    await browser.close();
  }
}
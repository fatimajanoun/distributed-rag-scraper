import { chromium } from "playwright";
import {
  buildPageContent,
  extractPageContent,
} from "@rag-scraper/shared";

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

    // Give JavaScript time to render the page content.
    await page.waitForTimeout(2_000);

    const rawHtml = await page.content();
    const finalUrl = page.url();
    const statusCode = response?.status() ?? 200;

    const extracted = extractPageContent(
      rawHtml,
      finalUrl,
    );

    const content = buildPageContent({
      bodyText: extracted.bodyText,
      tables: extracted.tables,
      linkedDocuments: extracted.linkedDocuments,
    });

    return {
      url: finalUrl,
      title: extracted.title,
      text: content,
      tables: extracted.tables,
      linkedDocuments: extracted.linkedDocuments,
      rawHtml,
      statusCode,
      links: extracted.links,
    };
  } finally {
    await browser.close();
  }
}
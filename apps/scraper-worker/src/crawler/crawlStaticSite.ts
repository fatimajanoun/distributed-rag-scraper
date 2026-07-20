import {
  scrapeStaticPage,
  type ScrapedPage,
} from "../scraper/scrapeStaticPage.js";

import { normalizeUrl } from "../utils/normalizeURL.js";

export type CrawlResult = {
  pages: ScrapedPage[];
  visitedUrls: string[];
};

export async function crawlStaticSite(
  startUrl: string,
  maxPages = 5,
): Promise<CrawlResult> {
  const normalizedStartUrl = normalizeUrl(startUrl);
  const start = new URL(normalizedStartUrl);
  const allowedHostname = start.hostname;

  const pendingUrls: string[] = [normalizedStartUrl];
  const visitedUrls = new Set<string>();
  const pages: ScrapedPage[] = [];

  while (pendingUrls.length > 0 && pages.length < maxPages) {
    const currentUrl = pendingUrls.shift();

    if (!currentUrl || visitedUrls.has(currentUrl)) {
      continue;
    }

    visitedUrls.add(currentUrl);

    try {
      console.log(`Crawling: ${currentUrl}`);

      const page = await scrapeStaticPage(currentUrl);
      pages.push(page);

      for (const link of page.links) {
        const normalizedLink = normalizeUrl(link);
        const parsedLink = new URL(normalizedLink);

        const belongsToSameWebsite =
          parsedLink.hostname === allowedHostname;

        const isHttp =
          parsedLink.protocol === "http:" ||
          parsedLink.protocol === "https:";

        if (
          belongsToSameWebsite &&
          isHttp &&
          !visitedUrls.has(normalizedLink) &&
          !pendingUrls.includes(normalizedLink)
        ) {
          pendingUrls.push(normalizedLink);
        }
      }
    } catch (error) {
      console.error(
        `Failed to crawl ${currentUrl}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return {
    pages,
    visitedUrls: [...visitedUrls],
  };
}
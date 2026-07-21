import {
  scrapeStaticPage,
  type ScrapedPage,
} from "../scraper/scrapeStaticPage.js";

import { normalizeUrl } from "../utils/normalizeURL.js";
import { delay } from "../utils/delay.js";
import { fetchRobotsTxt } from "../robots/fetchRobotsTxt.js";
import { parseRobotsTxt } from "../robots/parseRobotsTxt.js";
import { isAllowedByRobots } from "../robots/isAllowedByRobots.js";
import { retry } from "../utils/retry.js";

export type CrawlResult = {
  pages: ScrapedPage[];
  visitedUrls: string[];
};

export async function crawlStaticSite(
  startUrl: string,
  maxPages = 5,
  delayMilliseconds = 500,
  maxRetryAttempts = 3,
): Promise<CrawlResult> {
  const normalizedStartUrl = normalizeUrl(startUrl);
  const start = new URL(normalizedStartUrl);
  const allowedHostname = start.hostname;

  const pendingUrls: string[] = [normalizedStartUrl];
  const visitedUrls = new Set<string>();
  const pages: ScrapedPage[] = [];
  const robotsText = await fetchRobotsTxt(startUrl);
  const disallowedPaths = parseRobotsTxt(robotsText);
  let hasAttemptedRequest = false;

  while (pendingUrls.length > 0 && pages.length < maxPages) {
    const currentUrl = pendingUrls.shift();

    if (!currentUrl || visitedUrls.has(currentUrl)) {
      continue;
    }

    visitedUrls.add(currentUrl);
    if (hasAttemptedRequest) {
      console.log(`Waiting ${delayMilliseconds} ms...`);
      await delay(delayMilliseconds);
    }

    hasAttemptedRequest = true;
    try {
      console.log(`Crawling: ${currentUrl}`);

      const page = await retry(
        () => scrapeStaticPage(currentUrl),
        maxRetryAttempts,
      );
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
          isAllowedByRobots(normalizedLink, disallowedPaths) &&
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
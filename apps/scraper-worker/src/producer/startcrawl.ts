import { crawlStaticSite } from "../crawler/crawlStaticSite.js";

async function startCrawl(): Promise<void> {
  const rawUrl = process.argv[2];

  if (!rawUrl) {
    console.error(
      "Please provide a URL. Example: npm run crawl --workspace apps/scraper-worker -- https://example.com",
    );

    process.exitCode = 1;
    return;
  }

  try {
    const url = new URL(rawUrl).toString();

    await crawlStaticSite(url);

    console.log(`Initial crawl job added for: ${url}`);
  } catch (error) {
    console.error("Failed to start crawl:", error);
    process.exitCode = 1;
  }
}

void startCrawl();
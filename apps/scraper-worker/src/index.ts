import { crawlStaticSite } from "./crawler/crawlStaticSite.js";

async function main(): Promise<void> {
  const url = process.argv[2];
  const maxPagesArgument = process.argv[3];

  if (!url) {
    console.error(
      "Please provide a URL. Example: npm run dev -- https://example.com 5",
    );

    process.exit(1);
  }

  const maxPages = maxPagesArgument
    ? Number.parseInt(maxPagesArgument, 10)
    : 5;

  if (!Number.isInteger(maxPages) || maxPages <= 0) {
    console.error("The maximum number of pages must be a positive integer.");
    process.exit(1);
  }

  try {
    console.log(`Starting crawl from: ${url}`);
    console.log(`Maximum pages: ${maxPages}\n`);

    const result = await crawlStaticSite(url, maxPages);

    console.log("\nCrawl completed.");
    console.log(`Pages successfully scraped: ${result.pages.length}`);
    console.log(`URLs attempted: ${result.visitedUrls.length}`);

    for (const page of result.pages) {
      console.log("\n--------------------------------");
      console.log(`URL: ${page.url}`);
      console.log(`Title: ${page.title}`);
      console.log(`Text preview: ${page.text.slice(0, 150)}`);
      console.log(`Links found: ${page.links.length}`);
    }
  } catch (error) {
    console.error(
      "Crawler failed:",
      error instanceof Error ? error.message : error,
    );

    process.exit(1);
  }
}

void main();
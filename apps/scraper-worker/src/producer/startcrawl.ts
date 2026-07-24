import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

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
    const { crawlStaticSite } = await import(
      "../crawler/crawlStaticSite.js"
    );

    const url = new URL(rawUrl).toString();

    console.log("Crawl command Redis:", {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    await crawlStaticSite(url);

    console.log(`Initial crawl job added for: ${url}`);
  } catch (error) {
    console.error("Failed to start crawl:", error);
    process.exitCode = 1;
  }
}

void startCrawl();
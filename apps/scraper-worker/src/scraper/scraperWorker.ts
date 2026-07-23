import { Worker } from "bullmq";
import { scrapeDlq } from "../queues/scrapeDlQ.js";
import type { ScrapeJob } from "../jobs/scrapeJob.js";
import {
  SCRAPE_QUEUE_NAME,
} from "../queues/scrapeQueue.js";
import { redisConnection } from "../queues/redisConnection.js";
import { retry } from "../utils/retry.js";
import { saveScrapedPage } from "@rag-scraper/database";
import {
  scrapeStaticPage,
  type ScrapedPage,
} from "./scrapeStaticPage.js";
const MAX_RETRY_ATTEMPTS = 3;
const SCRAPER_CONCURRENCY = 2;

export const scraperWorker = new Worker<
  ScrapeJob,
  ScrapedPage
>(
  SCRAPE_QUEUE_NAME,

  async (job) => {
    console.log(
      `Scraper worker processing ${job.data.url}`,
    );

    const page = await retry(
      () => scrapeStaticPage(job.data.url),
      MAX_RETRY_ATTEMPTS,
    );

    const result = await saveScrapedPage(page);

    console.log(
      `Page ${page.url} was ${result.status}`,
    );

    return page;
  },

  {
    connection: redisConnection,
    concurrency: SCRAPER_CONCURRENCY ?? 2,
  },
);

scraperWorker.on("completed", (job) => {
  console.log(
    `Scrape job ${job.id} completed: ${job.data.url}`,
  );
});

scraperWorker.on("failed", async (job, error) => {
  console.error(
    `Scrape job ${job?.id ?? "unknown"} failed:`,
    error.message,
  );

  if (!job) {
    return;
  }

  try {
    await scrapeDlq.add("failed-scrape", {
      originalJobId: job.id,
      url: job.data.url,
      error: error.message,
      failedAt: new Date().toISOString(),
    });

    console.log(
      `Scrape job ${job.id} moved to DLQ`,
    );
  } catch (dlqError) {
    console.error(
      `Failed to move scrape job ${job.id} to DLQ:`,
      dlqError,
    );
  }
});

scraperWorker.on("error", (error) => {
  console.error("Scraper worker error:", error);
});
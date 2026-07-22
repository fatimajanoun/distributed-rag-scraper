import { Worker } from "bullmq";

import type { ScrapeJob } from "../jobs/scrapeJob.js";
import {
  SCRAPE_QUEUE_NAME,
} from "../queues/scrapeQueue.js";
import { redisConnection } from "../queues/redisConnection.js";
import { retry } from "../utils/retry.js";
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

    return page;
  },

  {
    connection: redisConnection,
    concurrency: SCRAPER_CONCURRENCY,
  },
);

scraperWorker.on("completed", (job) => {
  console.log(
    `Scrape job ${job.id} completed: ${job.data.url}`,
  );
});

scraperWorker.on("failed", (job, error) => {
  console.error(
    `Scrape job ${job?.id ?? "unknown"} failed:`,
    error.message,
  );
});

scraperWorker.on("error", (error) => {
  console.error("Scraper worker error:", error);
});
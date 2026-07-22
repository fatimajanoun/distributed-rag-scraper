import { Queue, QueueEvents } from "bullmq";

import type { ScrapeJob } from "../jobs/scrapeJob.js";
import { redisConnection } from "./redisConnection.js";

export const SCRAPE_QUEUE_NAME = "scrape-jobs";

export const scrapeQueue = new Queue<ScrapeJob>(
  SCRAPE_QUEUE_NAME,
  {
    connection: redisConnection,
  },
);

export const scrapeQueueEvents = new QueueEvents(
  SCRAPE_QUEUE_NAME,
  {
    connection: redisConnection,
  },
);
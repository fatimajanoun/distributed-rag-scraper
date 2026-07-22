import { Queue } from "bullmq";
import type { CrawlJob } from "../jobs/crawlJob.js";
import { redisConnection } from "./redisConnection.js";

export const CRAWL_QUEUE_NAME = "crawl-jobs";

export const crawlQueue = new Queue<CrawlJob>(
  CRAWL_QUEUE_NAME,
  {
    connection: redisConnection,
  },
);
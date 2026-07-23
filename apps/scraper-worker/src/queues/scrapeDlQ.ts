import { Queue } from "bullmq";

import { redisConnection } from "./redisConnection.js";

export const SCRAPE_DLQ_NAME = "scrape-dlq";

export const scrapeDlq = new Queue(SCRAPE_DLQ_NAME, {
  connection: redisConnection,
});
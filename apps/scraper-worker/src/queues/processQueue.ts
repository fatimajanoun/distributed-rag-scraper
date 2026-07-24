import { Queue, QueueEvents } from "bullmq";

import type { ProcessPageJobData } from "@rag-scraper/shared";
import { redisConnection } from "./redisConnection.js";
import { PROCESS_QUEUE_NAME } from "@rag-scraper/shared";


export const processQueue = new Queue<ProcessPageJobData>(
  PROCESS_QUEUE_NAME,
  {
    connection: redisConnection,
  },
);

export const processQueueEvents = new QueueEvents(
  PROCESS_QUEUE_NAME,
  {
    connection: redisConnection,
  },
);
import { Worker } from "bullmq";
import type { ProcessPageJobData } from "@rag-scraper/shared";
import {
  PROCESS_QUEUE_NAME,
  processPageContent,
} from "@rag-scraper/shared";
import {
  findPageForProcessing,
  replacePageChunks,
} from "@rag-scraper/database";
import { redisConnection } from "../queues/redisConnection.js";

const PROCESSOR_CONCURRENCY = 2;

export const processorWorker = new Worker<ProcessPageJobData>(
  PROCESS_QUEUE_NAME,

  async (job) => {
    const { pageId, contentHash } = job.data;

    const page = await findPageForProcessing(pageId);

    if (!page) {
      throw new Error(`Page ${pageId} was not found`);
    }

    if (page.contentHash !== contentHash) {
      console.log(
        `Skipping stale processing job ${job.id} for page ${pageId}`,
      );

      return;
    }

    const chunks = processPageContent(page.content);

    await replacePageChunks(pageId, chunks);

    console.log(
      `Processed page ${pageId}: ${chunks.length} chunks created`,
    );
  },

  {
    connection: redisConnection,
    concurrency: PROCESSOR_CONCURRENCY,
  },
);

processorWorker.on("completed", (job) => {
  console.log(`Processing job ${job.id} completed`);
});

processorWorker.on("failed", (job, error) => {
  console.error(
    `Processing job ${job?.id ?? "unknown"} failed:`,
    error.message,
  );
});

processorWorker.on("error", (error) => {
  console.error("Processor worker error:", error);
});
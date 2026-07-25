import { Worker } from "bullmq";

import {
  PROCESS_QUEUE_NAME,
  processPageContent,
  type ProcessPageJobData,
} from "@rag-scraper/shared";

import {
  findPageForProcessing,
  replacePageChunks,
} from "@rag-scraper/database";

import { redisConnection } from "../queues/redisConnection.js";
import { generateEmbedding } from "../../../api/src/embeddings/generateEmbedding.js";
const PROCESSOR_CONCURRENCY = 2;
console.log("Consumer queue name:", PROCESS_QUEUE_NAME);
console.log("Consumer Redis:", redisConnection);
export const processorWorker = new Worker<ProcessPageJobData>(
  PROCESS_QUEUE_NAME,

  async (job) => {
    const { pageId, contentHash } = job.data;

    console.log(
      `Processing page ${pageId} from job ${job.id ?? "unknown"}`,
    );

    const page = await findPageForProcessing(pageId);

    if (!page) {
      throw new Error(`Page ${pageId} was not found`);
    }

    if (page.contentHash !== contentHash) {
      console.log(
        `Skipping stale job ${job.id ?? "unknown"} for page ${pageId}`,
      );

      return;
    }

    const chunks = processPageContent(page.content);

    const chunksWithEmbeddings = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(
        chunk.content,
      );

      chunksWithEmbeddings.push({
        ...chunk,
        embedding,
      });
    }

    await replacePageChunks(
      pageId,
      chunksWithEmbeddings,
    );

    console.log(
      `Page ${pageId} processed successfully: ${chunksWithEmbeddings.length} chunks saved`,
    );
  },

  {
    connection: redisConnection,
    concurrency: PROCESSOR_CONCURRENCY,
  },
);

processorWorker.on("completed", (job) => {
  console.log(
    `Processing job ${job.id ?? "unknown"} completed`,
  );
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

processorWorker.on("ready", () => {
  console.log(
    `Processor worker is ready and listening to ${PROCESS_QUEUE_NAME}`,
  );
});
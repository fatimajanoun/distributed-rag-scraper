import { Queue } from "bullmq";
import { redisConnection } from "./apps/scraper-worker/src/queues/redisConnection.js";


async function clearQueues() {

  const queues = [
    new Queue("crawl-queue", {
      connection: redisConnection,
    }),

    new Queue("scrape-queue", {
      connection: redisConnection,
    }),

    new Queue("process-queue", {
      connection: redisConnection,
    }),
  ];


  for (const queue of queues) {

    console.log(`Clearing queue: ${queue.name}`);

    await queue.obliterate({
      force: true,
    });

    console.log(`Cleared: ${queue.name}`);
  }


  process.exit(0);
}


clearQueues().catch((error) => {
  console.error(error);
  process.exit(1);
});
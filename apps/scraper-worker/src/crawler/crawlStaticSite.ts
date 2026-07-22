import { crawlQueue } from "../queues/crawlQueue.js";

export async function crawlStaticSite(url: string): Promise<void> {
  await crawlQueue.add(
    "crawl-page",
    {
      url,
      depth: 0,
    },
    {
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
}
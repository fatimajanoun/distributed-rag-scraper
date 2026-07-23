import { createHash } from "node:crypto";

import { Worker } from "bullmq";

import type { CrawlJob } from "../jobs/crawlJob.js";
import type { ScrapeJob } from "../jobs/scrapeJob.js";
import { fetchRobotsTxt } from "../robots/fetchRobotsTxt.js";
import { isAllowedByRobots } from "../robots/isAllowedByRobots.js";
import {
    CRAWL_QUEUE_NAME,
    crawlQueue,
} from "../queues/crawlQueue.js";
import { redisConnection } from "../queues/redisConnection.js";
import {
    scrapeQueue,
    scrapeQueueEvents,
} from "../queues/scrapeQueue.js";
import type { ScrapedPage } from "../scraper/scrapeStaticPage.js";
import { normalizeUrl } from "../utils/normalizeURL.js";
import { parseRobotsTxt } from "../robots/parseRobotsTxt.js";
import { workerId } from "../config/workerId.js";
const CRAWLER_CONCURRENCY = Number(
    process.env.CRAWLER_CONCURRENCY ?? 2,
);

const MAX_CRAWL_DEPTH = Number(
    process.env.MAX_CRAWL_DEPTH ?? 2,
);

const SCRAPE_TIMEOUT_MS = Number(
    process.env.SCRAPE_TIMEOUT_MS ?? 30_000,
);

/**
 * Creates a stable BullMQ job ID for a URL.
 *
 * This prevents the same normalized URL from being added
 * repeatedly to the crawl queue.
 */
function createUrlJobId(url: string): string {
    return createHash("sha256")
        .update(url)
        .digest("hex");
}

export const crawlerWorker = new Worker<CrawlJob>(
    CRAWL_QUEUE_NAME,

    async (job) => {
        const { url, depth } = job.data;

        console.log(
  `[${workerId}] Crawler worker processing ${job.data.url} at depth ${job.data.depth}`,
);

        /*
         * 1. Check robots.txt before requesting the page.
         */
        const robotsText = await fetchRobotsTxt(url);

        const disallowedPaths = parseRobotsTxt(robotsText);

        const allowed = isAllowedByRobots(
            url,
            disallowedPaths,
        );

        if (!allowed) {
            console.log(`Blocked by robots.txt: ${url}`);

            return {
                url,
                depth,
                status: "blocked",
                discoveredUrls: 0,
            };
        }

        /*
         * 2. Create a scrape job.
         */
        const scrapeJobData: ScrapeJob = {
            url,
            crawlJobId: String(job.id),
        };

        const scrapeJob = await scrapeQueue.add(
            "scrape-page",
            scrapeJobData,
            {
                removeOnComplete: false,
                removeOnFail: false,
            },
        );

        /*
         * 3. Wait for a scraper worker to process the page.
         *
         * The value returned by scraperWorker becomes page.
         */
        const page = await scrapeJob.waitUntilFinished(
            scrapeQueueEvents,
            SCRAPE_TIMEOUT_MS,
        ) as ScrapedPage;

        /*
         * Stop discovering additional URLs once the maximum
         * crawl depth is reached.
         */
        if (depth >= MAX_CRAWL_DEPTH) {
            return {
                url,
                depth,
                status: "completed",
                discoveredUrls: 0,
            };
        }

        /*
         * 4. Normalize and enqueue links discovered by the scraper.
         */
        let discoveredUrls = 0;

        for (const link of page.links) {
            const normalizedUrl = normalizeUrl(
                link,
                url,
            );

            if (!normalizedUrl) {
                continue;
            }

            /*
             * Keep the crawl within the same website.
             */
            if (
                new URL(normalizedUrl).origin !==
                new URL(url).origin
            ) {
                continue;
            }

            const nextCrawlJob: CrawlJob = {
                url: normalizedUrl,
                depth: depth + 1,
                parentUrl: url,
            };

            await crawlQueue.add(
                "crawl-page",
                nextCrawlJob,
                {

                    jobId: createUrlJobId(normalizedUrl),
                    removeOnComplete: false,
                    removeOnFail: false,
                },
            );

            discoveredUrls++;
        }

        return {
            url,
            depth,
            status: "completed",
            discoveredUrls,
        };
    },

    {
        connection: redisConnection,
        concurrency: CRAWLER_CONCURRENCY,
    },
);

crawlerWorker.on("completed", (job, result) => {
    console.log(
        `Crawl job ${job.id} completed:`,
        result,
    );
});

crawlerWorker.on("failed", (job, error) => {
    console.error(
        `Crawl job ${job?.id ?? "unknown"} failed:`,
        error.message,
    );
});

crawlerWorker.on("error", (error) => {
    console.error("Crawler worker error:", error);
});
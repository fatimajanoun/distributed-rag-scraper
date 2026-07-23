import "./crawler/crawlerWorker.js";
import "./scraper/scraperWorker.js";
import os from "node:os";

const workerId =
  process.env.WORKER_ID ??
  `${os.hostname()}-${process.pid}`;
console.log(
  `[${workerId}] Crawler and scraper workers started.`,
);
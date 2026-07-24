import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

await import("./crawler/crawlerWorker.js");
await import("./scraper/scraperWorker.js");

console.log("Crawler and scraper workers started.");
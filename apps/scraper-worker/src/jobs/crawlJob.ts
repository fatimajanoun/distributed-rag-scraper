export type CrawlJob = {
  url: string;
  depth: number;
  parentUrl?: string;
};
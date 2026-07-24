import * as cheerio from "cheerio";
import { HttpError } from "../utils/HttpError.js";
import { extractPageContent } from "@rag-scraper/shared";
import {
  buildPageContent,
} from "@rag-scraper/shared";
export type ScrapedPage = {
  url: string;
  title: string;
  text: string;
  tables: string[];
  linkedDocuments: {
    text: string;
    url: string;
  }[];
  rawHtml: string;
  statusCode: number;
  links: string[];
};

export async function scrapeStaticPage(url: string): Promise<ScrapedPage> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "DistributedRAGScraper/1.0",
    },
  });

  if (!response.ok) {
  throw new HttpError(
    response.status,
    `Failed to fetch page: ${response.status}`,
  );
}

  const rawHtml = await response.text();

  const extracted = extractPageContent(rawHtml, url);

  const text = buildPageContent({
  bodyText: extracted.bodyText,
  tables: extracted.tables,
  linkedDocuments: extracted.linkedDocuments,
});

  return {
    url,
    title: extracted.title,
    text,
    tables: extracted.tables,
    linkedDocuments: extracted.linkedDocuments,
    rawHtml,
    statusCode: response.status,
    links: extracted.links,
  };
}
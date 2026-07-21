import * as cheerio from "cheerio";
import { HttpError } from "../utils/HttpError.js";

export type ScrapedPage = {
  url: string;
  title: string;
  text: string;
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

  const html = await response.text();

  const $ = cheerio.load(html);

  // Remove elements that normally do not contain useful page content.
  $("script, style, noscript").remove();

  const title = $("title").first().text().trim();

  const text = $("body")
  .text()
  .replace(/\s+/g, " ")
  .trim();

  const links = $("a[href]")
    .map((_, element) => {
      const href = $(element).attr("href");

      if (!href) {
        return null;
      }

      try {
        return new URL(href, url).toString();
      } catch {
        return null;
      }
    })
    .get()
    .filter((link): link is string => link !== null);

  return {
    url,
    title,
    text,
    links: [...new Set(links)],
  };
}
import { db } from "../db.js";
import { generateContentHash } from "../utils/hash.js";
 
export type SaveScrapedPageInput = {
  url: string;
  title: string;
  text: string;
  rawHtml: string;
  statusCode: number;
};

export async function saveScrapedPage(
  page: SaveScrapedPageInput,
): Promise<void> {
  const contentHash = generateContentHash(page.text);
  await db.query(
    `
      INSERT INTO scraped_pages (
        url,
        title,
        raw_html,
        content,
        content_hash,
        status_code,
        first_scraped_at,
        last_scraped_at,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW(),NOW())
    `,
    [
      page.url,
      page.title,
      page.rawHtml,
      page.text,
      contentHash,
      page.statusCode,
    ],
  );
}
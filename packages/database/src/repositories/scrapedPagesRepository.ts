import { db } from "../db.js";
import { generateContentHash } from "../utils/hash.js";

export type SaveScrapedPageInput = {
  url: string;
  title: string;
  text: string;
  rawHtml: string;
  statusCode: number;
};

export type SaveScrapedPageResult = {
  pageId: number;
  contentHash: string;
  status: "inserted" | "updated" | "unchanged";
};

export async function saveScrapedPage(
  page: SaveScrapedPageInput,
): Promise<SaveScrapedPageResult> {
  const contentHash = generateContentHash(page.text);

  const existingPage = await db.query<{
    id: string;
    content_hash: string;
  }>(
    `
      SELECT id, content_hash
      FROM scraped_pages
      WHERE url = $1
    `,
    [page.url],
  );

  if (existingPage.rowCount === 0) {
    const insertedPage = await db.query<{ id: string }>(
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
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
        RETURNING id
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

    const insertedId = insertedPage.rows[0]?.id;

    if (!insertedId) {
      throw new Error("Failed to retrieve inserted page ID");
    }

    return {
      pageId: Number(insertedId),
      contentHash,
      status: "inserted",
    };
  }

  const currentPage = existingPage.rows[0];

  if (!currentPage) {
    throw new Error("Existing page was not returned");
  }

  if (currentPage.content_hash === contentHash) {
    await db.query(
      `
        UPDATE scraped_pages
        SET last_scraped_at = NOW()
        WHERE id = $1
      `,
      [currentPage.id],
    );

    return {
      pageId: Number(currentPage.id),
      contentHash,
      status: "unchanged",
    };
  }

  await db.query(
    `
      UPDATE scraped_pages
      SET
        title = $2,
        raw_html = $3,
        content = $4,
        content_hash = $5,
        status_code = $6,
        last_scraped_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      currentPage.id,
      page.title,
      page.rawHtml,
      page.text,
      contentHash,
      page.statusCode,
    ],
  );

  return {
    pageId: Number(currentPage.id),
    contentHash,
    status: "updated",
  };
}
import { db } from "../db.js";
import { saveScrapedPageSchema } from "../schemas/scrapedPageSchema.js";
import { generateContentHash } from "../utils/hash.js";

import { savePageVersion } from "./pageVersionRepository.js";

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
  const validationResult = saveScrapedPageSchema.safeParse(page);

  if (!validationResult.success) {
    throw new Error(
      `Invalid scraped page data: ${validationResult.error.message}`,
    );
  }

  const validatedPage = validationResult.data;
  const contentHash = generateContentHash(validatedPage.text);

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existingPage = await client.query<{
      id: string;
      content_hash: string;
    }>(
      `
        SELECT id, content_hash
        FROM scraped_pages
        WHERE url = $1
        FOR UPDATE
      `,
      [validatedPage.url],
    );

    if (existingPage.rowCount === 0) {
      const insertedPage = await client.query<{ id: string }>(
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
          validatedPage.url,
          validatedPage.title,
          validatedPage.rawHtml,
          validatedPage.text,
          contentHash,
          validatedPage.statusCode,
        ],
      );

      const insertedId = insertedPage.rows[0]?.id;

      if (!insertedId) {
        throw new Error("Failed to retrieve inserted page ID");
      }

      const pageId = Number(insertedId);

      await savePageVersion({
        client,
        pageId,
        page: validatedPage,
        contentHash,
      });

      await client.query("COMMIT");

      return {
        pageId,
        contentHash,
        status: "inserted",
      };
    }

    const currentPage = existingPage.rows[0];

    if (!currentPage) {
      throw new Error("Existing page was not returned");
    }

    const pageId = Number(currentPage.id);

    if (currentPage.content_hash === contentHash) {
      await client.query(
        `
          UPDATE scraped_pages
          SET last_scraped_at = NOW()
          WHERE id = $1
        `,
        [currentPage.id],
      );

      await client.query("COMMIT");

      return {
        pageId,
        contentHash,
        status: "unchanged",
      };
    }

    await client.query(
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
        validatedPage.title,
        validatedPage.rawHtml,
        validatedPage.text,
        contentHash,
        validatedPage.statusCode,
      ],
    );

    await savePageVersion({
      client,
      pageId,
      page: validatedPage,
      contentHash,
    });

    await client.query("COMMIT");

    return {
      pageId,
      contentHash,
      status: "updated",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}export interface ScrapedPageSummary {
  id: number;
  url: string;
  title: string | null;
  statusCode: number;
  firstScrapedAt: Date;
  lastScrapedAt: Date;
}


export interface ScrapedPageDetails {
  id: number;
  url: string;
  title: string | null;
  content: string;
  rawHtml: string;
  statusCode: number;
  firstScrapedAt: Date;
  lastScrapedAt: Date;
}


export async function findAllScrapedPages(
  limit = 20,
  offset = 0,
): Promise<ScrapedPageSummary[]> {

  const result = await db.query<{
    id: string;
    url: string;
    title: string | null;
    statusCode: number;
    firstScrapedAt: Date;
    lastScrapedAt: Date;
  }>(
    `
      SELECT
        id,
        url,
        title,
        status_code AS "statusCode",
        first_scraped_at AS "firstScrapedAt",
        last_scraped_at AS "lastScrapedAt"
      FROM scraped_pages
      ORDER BY first_scraped_at DESC
      LIMIT $1
      OFFSET $2
    `,
    [
      limit,
      offset,
    ],
  );


  return result.rows.map((page) => ({
    ...page,
    id: Number(page.id),
  }));
}



export async function findScrapedPageById(
  id: number,
): Promise<ScrapedPageDetails | null> {

  const result = await db.query<{
    id: string;
    url: string;
    title: string | null;
    content: string;
    rawHtml: string;
    statusCode: number;
    firstScrapedAt: Date;
    lastScrapedAt: Date;
  }>(
    `
      SELECT
        id,
        url,
        title,
        content,
        raw_html AS "rawHtml",
        status_code AS "statusCode",
        first_scraped_at AS "firstScrapedAt",
        last_scraped_at AS "lastScrapedAt"
      FROM scraped_pages
      WHERE id = $1
    `,
    [id],
  );


  const page = result.rows[0];

  if (!page) {
    return null;
  }


  return {
    ...page,
    id: Number(page.id),
  };
}
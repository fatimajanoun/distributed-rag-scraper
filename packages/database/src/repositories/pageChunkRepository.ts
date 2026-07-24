import type { PoolClient } from "pg";

import { db } from "../db.js";

export interface PageChunkInput {
  index: number;
  content: string;
  contentHash: string;
  characterCount: number;
  wordCount: number;
}

export interface ScrapedPageForProcessing {
  id: number;
  url: string;
  title: string | null;
  content: string;
  contentHash: string;
}

export async function findPageForProcessing(
  pageId: number,
): Promise<ScrapedPageForProcessing | null> {
  const result = await db.query<{
    id: string;
    url: string;
    title: string | null;
    content: string;
    contentHash: string;
  }>(
    `
      SELECT
        id,
        url,
        title,
        content,
        content_hash AS "contentHash"
      FROM scraped_pages
      WHERE id = $1
    `,
    [pageId],
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

async function insertChunks(
  client: PoolClient,
  pageId: number,
  chunks: PageChunkInput[],
): Promise<void> {
  for (const chunk of chunks) {
    await client.query(
      `
        INSERT INTO page_chunks (
          page_id,
          chunk_index,
          content,
          content_hash,
          character_count,
          word_count
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        pageId,
        chunk.index,
        chunk.content,
        chunk.contentHash,
        chunk.characterCount,
        chunk.wordCount,
      ],
    );
  }
}

export async function replacePageChunks(
  pageId: number,
  chunks: PageChunkInput[],
): Promise<void> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        DELETE FROM page_chunks
        WHERE page_id = $1
      `,
      [pageId],
    );

    await insertChunks(client, pageId, chunks);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function countPageChunks(
  pageId: number,
): Promise<number> {
  const result = await db.query<{ count: string }>(
    `
      SELECT COUNT(*) AS count
      FROM page_chunks
      WHERE page_id = $1
    `,
    [pageId],
  );

  return Number(result.rows[0]?.count ?? 0);
}
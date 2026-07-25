import type { PoolClient } from "pg";

import { db } from "../db.js";

export interface PageChunkInput {
  index: number;
  content: string;
  contentHash: string;
  characterCount: number;
  wordCount: number;
  embedding: number[];
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

function formatEmbedding(
  embedding: number[],
): string {
  return `[${embedding.join(",")}]`;
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
          word_count,
          embedding,
          embedded_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::vector, NOW())
      `,
      [
        pageId,
        chunk.index,
        chunk.content,
        chunk.contentHash,
        chunk.characterCount,
        chunk.wordCount,
        formatEmbedding(chunk.embedding),
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

export interface SimilarChunk {
  id: number;
  pageId: number;
  content: string;
  distance: number;
  url: string;
  title: string | null;
}
export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit = 5,
): Promise<SimilarChunk[]> {

  const result = await db.query<{
  id: string;
  pageId: string;
  content: string;
  distance: number;
  url: string;
  title: string | null;
}>(
  `
    SELECT
      pc.id,
      pc.page_id AS "pageId",
      pc.content,
      sp.url,
      sp.title,
      pc.embedding <=> $1::vector AS distance
    FROM page_chunks pc
    JOIN scraped_pages sp
      ON sp.id = pc.page_id
    WHERE pc.embedding IS NOT NULL
    ORDER BY pc.embedding <=> $1::vector
    LIMIT $2
  `,
  [
    `[${queryEmbedding.join(",")}]`,
    limit,
  ],
);

  return result.rows.map((row) => ({
  id: Number(row.id),
  pageId: Number(row.pageId),
  content: row.content,
  distance: row.distance,
  url: row.url,
  title: row.title,
}));
}
export interface PageChunkResponse {
  id: number;
  chunkIndex: number;
  content: string;
  characterCount: number;
  wordCount: number;
  embeddedAt: Date | null;
}


export async function findChunksByPageId(
  pageId: number,
): Promise<PageChunkResponse[]> {

  const result = await db.query<{
    id: string;
    chunkIndex: number;
    content: string;
    characterCount: number;
    wordCount: number;
    embeddedAt: Date | null;
  }>(
    `
      SELECT
        id,
        chunk_index AS "chunkIndex",
        content,
        character_count AS "characterCount",
        word_count AS "wordCount",
        embedded_at AS "embeddedAt"
      FROM page_chunks
      WHERE page_id = $1
      ORDER BY chunk_index ASC
    `,
    [
      pageId,
    ],
  );


  return result.rows.map((chunk) => ({
    ...chunk,
    id: Number(chunk.id),
  }));
}
export async function searchKeywordChunks(
  query: string,
  limit = 5,
): Promise<SimilarChunk[]> {

  const result = await db.query<{
    id: string;
    pageId: string;
    content: string;
    distance: number;
    url: string;
    title: string | null;
  }>(
    `
      SELECT
        pc.id,
        pc.page_id AS "pageId",
        pc.content,
        sp.url,
        sp.title,
        ts_rank(
          to_tsvector('english', pc.content),
          plainto_tsquery('english', $1)
        ) AS distance
      FROM page_chunks pc
      JOIN scraped_pages sp
        ON sp.id = pc.page_id
      WHERE to_tsvector('english', pc.content)
        @@ plainto_tsquery('english', $1)
      ORDER BY distance DESC
      LIMIT $2
    `,
    [
      query,
      limit,
    ],
  );


  return result.rows.map((row) => ({
    id: Number(row.id),
    pageId: Number(row.pageId),
    content: row.content,
    distance: row.distance,
    url: row.url,
    title: row.title,
  }));
}
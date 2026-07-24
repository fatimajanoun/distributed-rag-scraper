import { db } from "../db.js";
export async function findPageForProcessing(pageId) {
    const result = await db.query(`
      SELECT
        id,
        url,
        title,
        content,
        content_hash AS "contentHash"
      FROM scraped_pages
      WHERE id = $1
    `, [pageId]);
    return result.rows[0] ?? null;
}
async function insertChunks(client, pageId, chunks) {
    for (const chunk of chunks) {
        await client.query(`
        INSERT INTO page_chunks (
          page_id,
          chunk_index,
          content,
          content_hash,
          character_count,
          word_count
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
            pageId,
            chunk.index,
            chunk.content,
            chunk.contentHash,
            chunk.characterCount,
            chunk.wordCount,
        ]);
    }
}
export async function replacePageChunks(pageId, chunks) {
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        await client.query(`
        DELETE FROM page_chunks
        WHERE page_id = $1
      `, [pageId]);
        await insertChunks(client, pageId, chunks);
        await client.query("COMMIT");
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
export async function countPageChunks(pageId) {
    const result = await db.query(`
      SELECT COUNT(*) AS count
      FROM page_chunks
      WHERE page_id = $1
    `, [pageId]);
    return Number(result.rows[0]?.count ?? 0);
}

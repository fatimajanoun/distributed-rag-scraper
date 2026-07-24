import { db } from "../db.js";
import { generateContentHash } from "../utils/hash.js";
export async function saveScrapedPage(page) {
    const contentHash = generateContentHash(page.text);
    const existingPage = await db.query(`
      SELECT content_hash
      FROM scraped_pages
      WHERE url = $1
    `, [page.url]);
    if (existingPage.rowCount === 0) {
        await db.query(`
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
      `, [
            page.url,
            page.title,
            page.rawHtml,
            page.text,
            contentHash,
            page.statusCode,
        ]);
        return { status: "inserted" };
    }
    const oldHash = existingPage.rows[0]?.content_hash;
    if (oldHash === contentHash) {
        await db.query(`
        UPDATE scraped_pages
        SET
          last_scraped_at = NOW()
        WHERE url = $1
      `, [page.url]);
        return { status: "unchanged" };
    }
    await db.query(`
      UPDATE scraped_pages
      SET
        title = $2,
        raw_html = $3,
        content = $4,
        content_hash = $5,
        status_code = $6,
        last_scraped_at = NOW(),
        updated_at = NOW()
      WHERE url = $1
    `, [
        page.url,
        page.title,
        page.rawHtml,
        page.text,
        contentHash,
        page.statusCode,
    ]);
    return { status: "updated" };
}

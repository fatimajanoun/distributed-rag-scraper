import type { PoolClient } from "pg";

import type { SaveScrapedPageInput } from "./scrapedPagesRepository.js";

type SavePageVersionInput = {
  client: PoolClient;
  pageId: number;
  page: SaveScrapedPageInput;
  contentHash: string;
};

export async function savePageVersion({
  client,
  pageId,
  page,
  contentHash,
}: SavePageVersionInput): Promise<void> {
  const latestVersion = await client.query<{
    version_number: number;
  }>(
    `
      SELECT version_number
      FROM scraped_page_versions
      WHERE page_id = $1
      ORDER BY version_number DESC
      LIMIT 1
    `,
    [pageId],
  );

  const nextVersion =
    (latestVersion.rows[0]?.version_number ?? 0) + 1;

  await client.query(
    `
      INSERT INTO scraped_page_versions (
        page_id,
        version_number,
        title,
        raw_html,
        content,
        content_hash,
        status_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      pageId,
      nextVersion,
      page.title,
      page.rawHtml,
      page.text,
      contentHash,
      page.statusCode,
    ],
  );
}
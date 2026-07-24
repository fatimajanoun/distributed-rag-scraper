import { db } from "./db.js";
import { saveScrapedPage } from "./repositories/scrapedPagesRepository.js";

async function testPageVersions(): Promise<void> {
  const testUrl = "https://test-version-history.local/page";

  try {
    // Clean previous test data.
    await db.query(
      `
        DELETE FROM scraped_pages
        WHERE url = $1
      `,
      [testUrl],
    );

    console.log("\n--- Test 1: Insert new page ---");

    const firstResult = await saveScrapedPage({
      url: testUrl,
      title: "Test Page",
      text: "This is the first version.",
      rawHtml: "<h1>Test Page</h1><p>This is the first version.</p>",
      statusCode: 200,
    });

    console.log(firstResult);

    console.log("\n--- Test 2: Save unchanged page ---");

    const secondResult = await saveScrapedPage({
      url: testUrl,
      title: "Test Page",
      text: "This is the first version.",
      rawHtml: "<h1>Test Page</h1><p>This is the first version.</p>",
      statusCode: 200,
    });

    console.log(secondResult);

    console.log("\n--- Test 3: Save changed page ---");

    const thirdResult = await saveScrapedPage({
      url: testUrl,
      title: "Updated Test Page",
      text: "This is the second version.",
      rawHtml:
        "<h1>Updated Test Page</h1><p>This is the second version.</p>",
      statusCode: 200,
    });

    console.log(thirdResult);

    console.log("\n--- Current page ---");

    const currentPage = await db.query(
      `
        SELECT id, url, title, content, content_hash
        FROM scraped_pages
        WHERE url = $1
      `,
      [testUrl],
    );

    console.table(currentPage.rows);

    console.log("\n--- Version history ---");

    const versions = await db.query(
      `
        SELECT
          spv.version_number,
          spv.title,
          spv.content,
          spv.content_hash,
          spv.created_at
        FROM scraped_page_versions spv
        JOIN scraped_pages sp
          ON sp.id = spv.page_id
        WHERE sp.url = $1
        ORDER BY spv.version_number
      `,
      [testUrl],
    );

    console.table(versions.rows);
  } catch (error) {
    console.error("Test failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

void testPageVersions();
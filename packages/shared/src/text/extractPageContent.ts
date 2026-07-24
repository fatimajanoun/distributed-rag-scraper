import * as cheerio from "cheerio";

export type LinkedDocument = {
  text: string;
  url: string;
};

export type ExtractedPageContent = {
  title: string;
  bodyText: string;
  tables: string[];
  linkedDocuments: LinkedDocument[];
  links: string[];
};

const DOCUMENT_EXTENSIONS =
  /\.(pdf|doc|docx|xls|xlsx|csv|txt|ppt|pptx)(?:$|[?#])/i;

export function extractPageContent(
  rawHtml: string,
  pageUrl: string,
): ExtractedPageContent {
  const $ = cheerio.load(rawHtml);

  const title = $("title").first().text().trim();

  // Remove elements that usually contain noise rather than useful content.
  $(
    [
      "script",
      "style",
      "noscript",
      "iframe",
      "svg",
      "canvas",
      "form",
    ].join(","),
  ).remove();

  const tables: string[] = [];

  // Extract tables separately so their row and column structure is preserved.
  $("table").each((_, tableElement) => {
    const rows: string[] = [];

    $(tableElement)
      .find("tr")
      .each((_, rowElement) => {
        const cells = $(rowElement)
          .find("th, td")
          .map((_, cellElement) =>
            $(cellElement)
              .text()
              .replace(/\s+/g, " ")
              .trim(),
          )
          .get()
          .filter((cell) => cell.length > 0);

        if (cells.length > 0) {
          rows.push(cells.join(" | "));
        }
      });

    if (rows.length > 0) {
      tables.push(rows.join("\n"));
    }

    // Remove the table after extracting it so its text is not duplicated
    // inside bodyText.
    $(tableElement).remove();
  });

  const links: string[] = [];
  const linkedDocuments: LinkedDocument[] = [];

  $("a[href]").each((_, anchorElement) => {
    const href = $(anchorElement).attr("href");

    if (!href) {
      return;
    }

    try {
      const absoluteUrl = new URL(href, pageUrl).toString();

      links.push(absoluteUrl);

      if (DOCUMENT_EXTENSIONS.test(absoluteUrl)) {
        linkedDocuments.push({
          text:
            $(anchorElement)
              .text()
              .replace(/\s+/g, " ")
              .trim() || "Linked document",
          url: absoluteUrl,
        });
      }
    } catch {
      // Ignore invalid URLs.
    }
  });

  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return {
    title,
    bodyText,
    tables,
    linkedDocuments: removeDuplicateDocuments(linkedDocuments),
    links: [...new Set(links)],
  };
}

function removeDuplicateDocuments(
  documents: LinkedDocument[],
): LinkedDocument[] {
  const documentsByUrl = new Map<string, LinkedDocument>();

  for (const document of documents) {
    if (!documentsByUrl.has(document.url)) {
      documentsByUrl.set(document.url, document);
    }
  }

  return [...documentsByUrl.values()];
}
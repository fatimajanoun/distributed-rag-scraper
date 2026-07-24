import type {
  LinkedDocument,
} from "./extractPageContent.js";

export type BuildPageContentInput = {
  bodyText: string;
  tables: string[];
  linkedDocuments: LinkedDocument[];
};

export function buildPageContent({
  bodyText,
  tables,
  linkedDocuments,
}: BuildPageContentInput): string {
  const sections: string[] = [];

  if (bodyText.trim()) {
    sections.push(bodyText.trim());
  }

  tables.forEach((table, index) => {
    if (table.trim()) {
      sections.push(`Table ${index + 1}\n${table.trim()}`);
    }
  });

  linkedDocuments.forEach((document) => {
    sections.push(
      `Linked document: ${document.text} - ${document.url}`,
    );
  });

  return sections.join("\n\n");
}
export interface PreprocessTextOptions {
  preserveParagraphs?: boolean;
}

export function preprocessText(
  input: string,
  options: PreprocessTextOptions = {},
): string {
  const { preserveParagraphs = true } = options;

  if (!input) {
    return "";
  }

  let text = input
    // Normalize Windows and old Mac line endings.
    .replace(/\r\n?/g, "\n")

    // Remove null characters.
    .replace(/\u0000/g, "")

    // Replace non-breaking spaces.
    .replace(/\u00a0/g, " ")

    // Remove zero-width characters.
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // Remove spaces around line breaks.
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n");

  if (preserveParagraphs) {
    text = text
      // Collapse spaces inside each line.
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")

      // Keep paragraph separation but remove excessive blank lines.
      .replace(/\n{3,}/g, "\n\n");
  } else {
    text = text.replace(/\s+/g, " ");
  }

  return text.trim();
}
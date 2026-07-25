import { describe, expect, it } from "vitest";

import { chunkText } from "./text/chunkText.js";

describe("chunkText", () => {
  it("returns an empty array for empty input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   ")).toEqual([]);
  });

  it("keeps short content inside one chunk", () => {
    const input =
      "This is a short paragraph that does not exceed the maximum size.";

    const chunks = chunkText(input, {
      maxChunkSize: 200,
      chunkOverlap: 30,
      minimumChunkSize: 20,
    });

    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.content).toBe(input);
    expect(chunks[0]?.index).toBe(0);
    expect(chunks[0]?.characterCount).toBe(input.length);
    expect(chunks[0]?.wordCount).toBe(12);
    expect(chunks[0]?.contentHash).toHaveLength(64);
  });

  it("keeps normal paragraphs intact", () => {
    const paragraph1 =
      "Paragraph one contains information about the scraping process.";

    const paragraph2 =
      "Paragraph two explains how the extracted content is processed.";

    const paragraph3 =
      "Paragraph three describes how chunks are stored in the database.";

    const input = [
      paragraph1,
      paragraph2,
      paragraph3,
    ].join("\n\n");

    const chunks = chunkText(input, {
      maxChunkSize: 130,
      chunkOverlap: 20,
      minimumChunkSize: 20,
    });

    expect(chunks.length).toBeGreaterThan(1);

    for (const paragraph of [
      paragraph1,
      paragraph2,
      paragraph3,
    ]) {
      const containingChunks = chunks.filter((chunk) =>
        chunk.content.includes(paragraph),
      );

      expect(containingChunks.length).toBeGreaterThan(0);
    }
  });

  it("adds meaningful overlap between consecutive chunks", () => {
    const paragraph1 =
      "The crawler discovers URLs from the starting page.";

    const paragraph2 =
      "The scraper downloads and extracts useful page content.";

    const paragraph3 =
      "The processor cleans the content and creates text chunks.";

    const paragraph4 =
      "The embedding worker stores vector representations.";

    const input = [
      paragraph1,
      paragraph2,
      paragraph3,
      paragraph4,
    ].join("\n\n");

    const chunks = chunkText(input, {
      maxChunkSize: 125,
      chunkOverlap: 70,
      minimumChunkSize: 20,
    });

    expect(chunks.length).toBeGreaterThan(1);

    const firstChunk = chunks[0];
    const secondChunk = chunks[1];

    expect(firstChunk).toBeDefined();
    expect(secondChunk).toBeDefined();

    // The final paragraph/unit from the first chunk should appear
    // again at the beginning of the second chunk.
    const firstChunkParagraphs =
      firstChunk?.content.split("\n\n") ?? [];

    const lastParagraphOfFirstChunk =
      firstChunkParagraphs.at(-1);

    expect(lastParagraphOfFirstChunk).toBeDefined();
    expect(secondChunk?.content).toContain(
      lastParagraphOfFirstChunk,
    );
  });

  it("splits a paragraph larger than the maximum chunk size", () => {
    const input = [
      "This is the first sentence of a very large paragraph.",
      "This is the second sentence containing more information.",
      "This is the third sentence that continues the explanation.",
      "This is the fourth sentence that finishes the paragraph.",
    ].join(" ");

    const chunks = chunkText(input, {
      maxChunkSize: 100,
      chunkOverlap: 20,
      minimumChunkSize: 20,
    });

    expect(chunks.length).toBeGreaterThan(1);

    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(100);
      expect(chunk.content.length).toBeGreaterThan(0);
    }
  });

  it("creates correct indexes and metadata", () => {
    const input = [
      "First paragraph with enough information for testing.",
      "Second paragraph with additional information for testing.",
      "Third paragraph with more useful information for testing.",
      "Fourth paragraph that completes the test document.",
    ].join("\n\n");

    const chunks = chunkText(input, {
      maxChunkSize: 110,
      chunkOverlap: 30,
      minimumChunkSize: 20,
    });

    chunks.forEach((chunk, index) => {
      expect(chunk.index).toBe(index);
      expect(chunk.characterCount).toBe(
        chunk.content.length,
      );

      expect(chunk.wordCount).toBe(
        chunk.content.trim().split(/\s+/).length,
      );

      expect(chunk.contentHash).toMatch(
        /^[a-f0-9]{64}$/,
      );
    });
  });

  it("throws an error for invalid options", () => {
    expect(() =>
      chunkText("Test", {
        maxChunkSize: 0,
      }),
    ).toThrow(
      "maxChunkSize must be greater than zero",
    );

    expect(() =>
      chunkText("Test", {
        maxChunkSize: 100,
        chunkOverlap: -1,
      }),
    ).toThrow(
      "chunkOverlap cannot be negative",
    );

    expect(() =>
      chunkText("Test", {
        maxChunkSize: 100,
        chunkOverlap: 100,
      }),
    ).toThrow(
      "chunkOverlap must be smaller than maxChunkSize",
    );

    expect(() =>
      chunkText("Test", {
        minimumChunkSize: -1,
      }),
    ).toThrow(
      "minimumChunkSize cannot be negative",
    );
  });
});
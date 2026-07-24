import { createHash } from "node:crypto";

import type { TextChunk } from "../types/processing.js";

export interface ChunkTextOptions {
  maxChunkSize?: number;
  chunkOverlap?: number;
  minimumChunkSize?: number;
}

const DEFAULT_MAX_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_MINIMUM_CHUNK_SIZE = 100;

function hashText(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function countWords(content: string): number {
  const trimmed = content.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

/**
 * Attempts to split text at a natural boundary before maxLength.
 */
function findSplitPosition(text: string, maxLength: number): number {
  if (text.length <= maxLength) {
    return text.length;
  }

  const candidate = text.slice(0, maxLength);

  const boundaries = [
    candidate.lastIndexOf("\n\n"),
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("? "),
    candidate.lastIndexOf("; "),
    candidate.lastIndexOf(", "),
    candidate.lastIndexOf(" "),
  ];

  const bestBoundary = Math.max(...boundaries);

  // Avoid producing a very small chunk just because an early boundary exists.
  if (bestBoundary >= maxLength * 0.6) {
    return bestBoundary + 1;
  }

  return maxLength;
}

export function chunkText(
  input: string,
  options: ChunkTextOptions = {},
): TextChunk[] {
  const maxChunkSize =
    options.maxChunkSize ?? DEFAULT_MAX_CHUNK_SIZE;

  const chunkOverlap =
    options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

  const minimumChunkSize =
    options.minimumChunkSize ?? DEFAULT_MINIMUM_CHUNK_SIZE;

  if (maxChunkSize <= 0) {
    throw new Error("maxChunkSize must be greater than zero");
  }

  if (chunkOverlap < 0) {
    throw new Error("chunkOverlap cannot be negative");
  }

  if (chunkOverlap >= maxChunkSize) {
    throw new Error(
      "chunkOverlap must be smaller than maxChunkSize",
    );
  }

  const text = input.trim();

  if (!text) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const remainingText = text.slice(cursor);
    const splitPosition = findSplitPosition(
      remainingText,
      maxChunkSize,
    );

    let chunkContent = remainingText
      .slice(0, splitPosition)
      .trim();

    if (!chunkContent) {
      cursor += Math.max(1, splitPosition);
      continue;
    }

    const remainingAfterChunk =
      text.length - (cursor + splitPosition);

    // Merge a tiny final remainder into the current chunk.
    if (
      remainingAfterChunk > 0 &&
      remainingAfterChunk < minimumChunkSize
    ) {
      chunkContent = text.slice(cursor).trim();
    }

    chunks.push({
      index: chunks.length,
      content: chunkContent,
      contentHash: hashText(chunkContent),
      characterCount: chunkContent.length,
      wordCount: countWords(chunkContent),
    });

    const consumedUntil = cursor + chunkContent.length;

    if (consumedUntil >= text.length) {
      break;
    }

    const nextCursor = consumedUntil - chunkOverlap;

    // Ensure the cursor always moves forward.
    cursor = Math.max(cursor + 1, nextCursor);

    // Do not start the next chunk in the middle of a word.
    while (
      cursor < text.length &&
      cursor > 0 &&
      !/\s/.test(text[cursor - 1] ?? "")
    ) {
      cursor += 1;
    }
  }

  return chunks;
}
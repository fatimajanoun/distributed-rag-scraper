import type { TextChunk } from "../types/processing.js";

import {
  chunkText,
  type ChunkTextOptions,
} from "./chunkText.js";

import { preprocessText } from "./preprocessText.js";

export function processPageContent(
  content: string,
  chunkOptions?: ChunkTextOptions,
): TextChunk[] {
  const cleanedContent = preprocessText(content);

  if (!cleanedContent) {
    return [];
  }

  return chunkText(cleanedContent, chunkOptions);
}
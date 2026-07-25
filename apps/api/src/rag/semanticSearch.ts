import { searchSimilarChunks } from "@rag-scraper/database";
import { generateEmbedding } from "../embeddings/generateEmbedding.js";

export async function semanticSearch(
  query: string,
  limit = 5,
) {
  const embedding =
    await generateEmbedding(query);

  return searchSimilarChunks(
    embedding,
    limit,
  );
}
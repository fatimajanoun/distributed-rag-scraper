import { generateEmbedding } from "../../api/src/embeddings/generateEmbedding.js";
import { generateAnswer } from "../../api/src/llm/generateAnswer.js";
import { searchSimilarChunks } from "@rag-scraper/database";

const question =
  "What is Example Domain used for?";

const embedding =
  await generateEmbedding(question);

const chunks =
  await searchSimilarChunks(
    embedding,
    5,
  );

const context =
  chunks
    .map(
      (chunk) =>
        chunk.content,
    )
    .join("\n\n");
console.log("Retrieved chunks:");
console.log(chunks);

console.log("Context sent to LLM:");
console.log(context);

const answer =
  await generateAnswer(
    question,
    context,
  );

console.log("Answer:");
console.log(answer);
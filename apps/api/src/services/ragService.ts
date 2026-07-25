import { searchSimilarChunks } from "@rag-scraper/database";
import { generateEmbedding } from "../embeddings/generateEmbedding.js";

const OLLAMA_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";


const SIMILARITY_THRESHOLD = 0.35;


export async function answerQuestion(
  question: string,
) {

  const queryEmbedding =
    await generateEmbedding(question);


  const chunks =
    await searchSimilarChunks(
      queryEmbedding,
      5,
    );


  // Check if retrieved information is relevant
  const relevantChunks = chunks.filter(
    (chunk) =>
      chunk.distance < SIMILARITY_THRESHOLD,
  );


  if (relevantChunks.length === 0) {
    return {
      answer:
        "I couldn't find information about this topic in my knowledge base.",
      sources: [],
    };
  }


  const context = relevantChunks
    .map(
      (chunk) =>
        chunk.content,
    )
    .join("\n\n");


  const response =
    await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: `
You are an assistant that answers questions using only the provided context.

If the answer is not contained in the context, say:
"I couldn't find information about this topic in my knowledge base."

Context:
${context}

Question:
${question}
          `,
          stream: false,
        }),
      },
    );


  const data =
    await response.json();


  return {
    answer: data.response,
    sources: relevantChunks.map(
      (chunk) => ({
        pageId: chunk.pageId,
      }),
    ),
  };
}
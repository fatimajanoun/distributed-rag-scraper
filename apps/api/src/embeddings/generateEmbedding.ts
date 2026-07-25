const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ??
  "http://localhost:11434";

const EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL ??
  "nomic-embed-text";

interface OllamaEmbeddingResponse {
  embeddings: number[][];
}

export async function generateEmbedding(
  text: string,
): Promise<number[]> {
  const cleanedText = text.trim();

  if (!cleanedText) {
    throw new Error(
      "Cannot generate an embedding for empty text.",
    );
  }

  const response = await fetch(
    `${OLLAMA_BASE_URL}/api/embed`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: cleanedText,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Ollama embedding request failed: ` +
        `${response.status} ${errorBody}`,
    );
  }

  const result =
    (await response.json()) as OllamaEmbeddingResponse;

  const embedding = result.embeddings[0];

  if (!embedding) {
    throw new Error(
      "Ollama returned no embedding.",
    );
  }

  return embedding;
}
const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ??
  "http://localhost:11434";

const LLM_MODEL =
  process.env.OLLAMA_LLM_MODEL ??
  "llama3.2";

interface OllamaGenerateResponse {
  response: string;
}

export async function generateAnswer(
  question: string,
  context: string,
): Promise<string> {

  const prompt = `
You are a helpful assistant answering questions using retrieved context.

Use the context below to answer the question.
If the context contains the answer, explain it clearly.
Do not say you don't know unless the context is completely unrelated.

Context:
${context}

Question:
${question}

If the answer is not present in the context, say:
"I don't know based on the provided information."
`;

  const response = await fetch(
    `${OLLAMA_BASE_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        prompt,
        stream: false,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Ollama generation failed: ${response.status} ${errorBody}`,
    );
  }

  const result =
    (await response.json()) as OllamaGenerateResponse;

  return result.response;
}
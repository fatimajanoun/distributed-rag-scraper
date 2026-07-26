const API_URL = "http://localhost:3000";

export async function askQuestion(
  question: string
) {
  const response = await fetch(
    `${API_URL}/api/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get answer");
  }

  return response.json();
}
import { delay } from "./delay.js";
import { HttpError } from "./HttpError.js";

function isRetryable(error: unknown): boolean {
  if (error instanceof HttpError) {
    // Retry only server errors (5xx)
    return error.status >= 500;
  }

  return true;
}

export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  initialDelay = 500,
): Promise<T> {
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        throw error;
      }

      console.warn(
        `Attempt ${attempt} failed. Retrying in ${currentDelay} ms...`,
      );

      await delay(currentDelay);

      currentDelay *= 2;
    }
  }

  throw new Error("Retry failed unexpectedly.");
}
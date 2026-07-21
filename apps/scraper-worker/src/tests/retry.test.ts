import { describe, expect, it, vi } from "vitest";

import { retry } from "../utils/retry.js";
import { HttpError } from "../utils/HttpError.js";

describe("retry", () => {
  it("returns the result when the operation succeeds on the first attempt", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await retry(operation);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries until the operation succeeds", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue("success");

    const result = await retry(operation, 3, 0);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("does not retry on a 404 HttpError", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(new HttpError(404, "Not Found"));

    await expect(retry(operation, 3, 0)).rejects.toThrow("Not Found");

    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries on a 500 HttpError until max attempts", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(new HttpError(500, "Internal Server Error"));

    await expect(retry(operation, 3, 0)).rejects.toThrow(
      "Internal Server Error",
    );

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("retries network errors until max attempts", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(new Error("Network failure"));

    await expect(retry(operation, 3, 0)).rejects.toThrow(
      "Network failure",
    );

    expect(operation).toHaveBeenCalledTimes(3);
  });
});
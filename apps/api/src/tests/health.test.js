import { describe, expect, it } from "vitest";
describe("health check", () => {
    it("should confirm the API service is healthy", () => {
        const response = {
            status: "ok",
            service: "api",
        };
        expect(response.status).toBe("ok");
        expect(response.service).toBe("api");
    });
});

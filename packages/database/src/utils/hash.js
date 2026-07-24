import { createHash } from "node:crypto";
export function generateContentHash(content) {
    return createHash("sha256")
        .update(content)
        .digest("hex");
}

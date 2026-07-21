import { normalizeUrl } from "../utils/normalizeURL.js";

export function isAllowedByRobots(
  url: string,
  disallowedPaths: string[],
): boolean {
  const pathname = new URL(normalizeUrl(url)).pathname;

  for (const disallowedPath of disallowedPaths) {
    if (pathname.startsWith(disallowedPath)) {
      return false;
    }
  }

  return true;
}
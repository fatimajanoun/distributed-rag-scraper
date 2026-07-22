export function normalizeUrl(
  rawUrl: string,
  baseUrl?: string,
): string {
  const url = baseUrl
    ? new URL(rawUrl, baseUrl)
    : new URL(rawUrl);

  url.hash = "";

  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.replace(/index\.html$/, "");
  }

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}
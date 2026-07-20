export function normalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  // Remove fragments such as #section
  url.hash = "";

  // Remove the default index page
  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.replace(/index\.html$/, "");
  }

  // Remove the trailing slash, except for the homepage
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}
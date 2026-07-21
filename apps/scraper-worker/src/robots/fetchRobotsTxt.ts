export async function fetchRobotsTxt(startUrl: string): Promise<string> {
  try {
    const origin = new URL(startUrl).origin;
    const robotsUrl = `${origin}/robots.txt`;

    const response = await fetch(robotsUrl, {
      headers: {
        "User-Agent": "DistributedRAGScraper/1.0",
      },
    });

    if (!response.ok) {
      return "";
    }

    return await response.text();
  } catch {
    return "";
  }
}
export async function fetchRobotsTxt(startUrl: string): Promise<string> {
    const url = new URL(startUrl);
    const robotsUrl = `${url.origin}/robots.txt`;

    const response = await fetch(robotsUrl);

    if (!response.ok) {
        return "";
    }

    return await response.text();
}
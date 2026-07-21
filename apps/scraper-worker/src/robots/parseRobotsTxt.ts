export function parseRobotsTxt(robotsText: string): string[] {
  const lines = robotsText.split(/\r?\n/);
  const disallowedPaths = new Set<string>();

  let appliesToAllCrawlers = false;
  let currentGroupHasDirectives = false;

  for (const line of lines) {
    const cleanedLine = line.split("#")[0]?.trim() ?? "";

    if (!cleanedLine) {
      continue;
    }

    const separatorIndex = cleanedLine.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const directive = cleanedLine
      .slice(0, separatorIndex)
      .trim()
      .toLowerCase();

    const value = cleanedLine
      .slice(separatorIndex + 1)
      .trim();

    if (directive === "user-agent") {
        // A User-agent appearing after directives starts a new group.
       
      if (currentGroupHasDirectives) {
        appliesToAllCrawlers = false;
        currentGroupHasDirectives = false;
      }

      if (value === "*") {
        appliesToAllCrawlers = true;
      }

      continue;
    }

    
    //  Any non-User-agent directive means we entered the rules
    //  section of the current group.
     
    currentGroupHasDirectives = true;

    if (
      directive === "disallow" &&
      appliesToAllCrawlers &&
      value !== ""
    ) {
      disallowedPaths.add(value);
    }
  }

  return [...disallowedPaths];
}
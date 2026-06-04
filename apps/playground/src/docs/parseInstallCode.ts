export interface ParsedCommands {
  npm: string;
  yarn: string;
  pnpm: string;
}

export function parseInstallCode(code: string): ParsedCommands | null {
  const trimmed = code.trim();

  // Case A: Multiline explicit commands showing comments like '# npm', '# yarn', '# pnpm'
  if (
    trimmed.includes("# npm") &&
    (trimmed.includes("# yarn") || trimmed.includes("# pnpm"))
  ) {
    let npm = "";
    let yarn = "";
    let pnpm = "";

    const lines = trimmed.split("\n");
    let currentKey: "npm" | "yarn" | "pnpm" | null = null;

    for (const line of lines) {
      const l = line.trim();
      if (!l) continue;
      if (l.toLowerCase().startsWith("# npm")) {
        currentKey = "npm";
      } else if (l.toLowerCase().startsWith("# yarn")) {
        currentKey = "yarn";
      } else if (l.toLowerCase().startsWith("# pnpm")) {
        currentKey = "pnpm";
      } else if (currentKey) {
        if (currentKey === "npm") npm += (npm ? "\n" : "") + l;
        else if (currentKey === "yarn") yarn += (yarn ? "\n" : "") + l;
        else if (currentKey === "pnpm") pnpm += (pnpm ? "\n" : "") + l;
      }
    }

    if (npm || yarn || pnpm) {
      return {
        npm:
          npm || "npm install @playerkit/react @playerkit/core @playerkit/ui",
        yarn: yarn || "yarn add @playerkit/react @playerkit/core @playerkit/ui",
        pnpm: pnpm || "pnpm add @playerkit/react @playerkit/core @playerkit/ui",
      };
    }
  }

  // Case B: Single line npm install command
  if (trimmed.startsWith("npm install ") || trimmed.startsWith("npm i ")) {
    const packages = trimmed.replace(/^npm (install|i)\s+/, "");
    return {
      npm: `npm install ${packages}`,
      yarn: `yarn add ${packages}`,
      pnpm: `pnpm add ${packages}`,
    };
  }

  return null;
}

/**
 * Minimal syntax highlighter for TSX/TS/JS/Bash code blocks.
 * Returns an array of {text, cls} tokens — no external dependencies.
 */

interface Token {
  text: string;
  cls: string;
}

const TS_KEYWORDS = new Set([
  "import",
  "export",
  "from",
  "default",
  "const",
  "let",
  "var",
  "function",
  "return",
  "type",
  "interface",
  "class",
  "extends",
  "implements",
  "new",
  "this",
  "super",
  "async",
  "await",
  "of",
  "in",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "throw",
  "try",
  "catch",
  "finally",
  "void",
  "never",
  "null",
  "undefined",
  "true",
  "false",
  "as",
  "is",
  "typeof",
  "keyof",
  "readonly",
  "public",
  "private",
  "protected",
  "static",
  "abstract",
  "enum",
  "namespace",
  "declare",
  "module",
  "require",
]);

const BASH_KEYWORDS = new Set([
  "npm",
  "yarn",
  "pnpm",
  "bun",
  "npx",
  "install",
  "add",
]);

export function highlight(code: string, lang: string): Token[] {
  if (lang === "bash" || lang === "sh") return highlightBash(code);
  return highlightTs(code);
}

function highlightBash(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (line === undefined) continue;
    if (li > 0) tokens.push({ text: "\n", cls: "" });
    if (line.startsWith("#")) {
      tokens.push({ text: line, cls: "sh-comment" });
      continue;
    }
    const words = line.split(/(\s+)/);
    for (const w of words) {
      if (BASH_KEYWORDS.has(w)) tokens.push({ text: w, cls: "sh-kw" });
      else if (w.startsWith("@")) tokens.push({ text: w, cls: "sh-pkg" });
      else tokens.push({ text: w, cls: "" });
    }
  }
  return tokens;
}

function highlightTs(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comment
    if (code.charAt(i) === "/" && code.charAt(i + 1) === "/") {
      const end = code.indexOf("\n", i);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ text: slice, cls: "ts-comment" });
      i += slice.length;
      continue;
    }
    // Block comment
    if (code.charAt(i) === "/" && code.charAt(i + 1) === "*") {
      const end = code.indexOf("*/", i + 2);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ text: slice, cls: "ts-comment" });
      i += slice.length;
      continue;
    }
    // Template literal
    if (code.charAt(i) === "`") {
      let j = i + 1;
      while (j < code.length && code.charAt(j) !== "`") {
        if (code.charAt(j) === "\\") j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), cls: "ts-str" });
      i = j + 1;
      continue;
    }
    // String (single or double quote)
    if (code.charAt(i) === '"' || code.charAt(i) === "'") {
      const q = code.charAt(i);
      let j = i + 1;
      while (
        j < code.length &&
        code.charAt(j) !== q &&
        code.charAt(j) !== "\n"
      ) {
        if (code.charAt(j) === "\\") j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), cls: "ts-str" });
      i = j + 1;
      continue;
    }
    // JSX tag / component name
    if (code.charAt(i) === "<" && /[A-Za-z/]/.test(code.charAt(i + 1))) {
      let j = i + 1;
      while (j < code.length && !/[\s>]/.test(code.charAt(j))) j++;
      const tag = code.slice(i, j);
      const cls = /[A-Z]/.test(tag.charAt(1)) ? "ts-component" : "ts-tag";
      tokens.push({ text: tag, cls });
      i = j;
      continue;
    }
    if (code.charAt(i) === ">" && i > 0) {
      tokens.push({ text: ">", cls: "ts-tag" });
      i++;
      continue;
    }
    // Number
    if (/[0-9]/.test(code.charAt(i))) {
      let j = i;
      while (j < code.length && /[0-9._]/.test(code.charAt(j))) j++;
      tokens.push({ text: code.slice(i, j), cls: "ts-num" });
      i = j;
      continue;
    }
    // Identifier or keyword
    if (/[A-Za-z_$]/.test(code.charAt(i))) {
      let j = i;
      while (j < code.length && /[A-Za-z0-9_$]/.test(code.charAt(j))) j++;
      const word = code.slice(i, j);
      let cls = "";
      if (TS_KEYWORDS.has(word)) cls = "ts-kw";
      else if (/^[A-Z]/.test(word)) cls = "ts-type";
      tokens.push({ text: word, cls });
      i = j;
      continue;
    }
    // Punctuation / operator / whitespace
    tokens.push({ text: code.charAt(i), cls: "" });
    i++;
  }

  return tokens;
}

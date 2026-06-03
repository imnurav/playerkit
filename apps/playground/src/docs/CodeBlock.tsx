import { InstallTabs } from "./InstallTabs";
import { parseInstallCode } from "./parseInstallCode";
import React, { useState, useCallback } from "react";
import { highlight } from "./highlight";

interface CodeBlockProps {
  lang: string;
  code: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = React.memo(
  ({ lang, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }, [code]);

    // If this is a bash block containing installation instructions, delegate to InstallTabs!
    if (lang === "bash" && parseInstallCode(code) !== null) {
      return <InstallTabs code={code} />;
    }

    const tokens = highlight(code, lang);

    return (
      <div className="docs-code-block">
        <div className="docs-code-header">
          <span className="docs-code-lang">{lang}</span>
          <button
            type="button"
            className={`docs-code-copy ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            aria-label="Copy code block"
          >
            {copied ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="docs-code-pre">
          {tokens.map((tok, i) =>
            tok.cls ? (
              <span key={i} className={tok.cls}>
                {tok.text}
              </span>
            ) : (
              tok.text
            ),
          )}
        </pre>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

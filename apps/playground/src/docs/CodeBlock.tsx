import { InstallTabs } from "./InstallTabs";
import { parseInstallCode } from "./parseInstallCode";
import React, { useState, useCallback } from "react";
import { highlight } from "./highlight";
import { copyToClipboard } from "../clipboard";
import { IconCheck, IconCopy } from "../icons/index";

interface CodeBlockProps {
  lang: string;
  code: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = React.memo(
  ({ lang, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      copyToClipboard(code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy code block:", err);
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
                <IconCheck />
                Copied!
              </>
            ) : (
              <>
                <IconCopy />
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

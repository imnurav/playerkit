import React, { useState, useCallback } from "react";
import { highlight } from "./highlight";
import { parseInstallCode } from "./parseInstallCode";
import { copyToClipboard } from "../clipboard";

interface InstallTabsProps {
  code: string;
}

export const InstallTabs: React.FC<InstallTabsProps> = ({ code }) => {
  const parsed = parseInstallCode(code);
  const [activeTab, setActiveTab] = useState<"npm" | "yarn" | "pnpm">("npm");
  const [copied, setCopied] = useState(false);

  const activeCommand = parsed ? parsed[activeTab] : "";

  const handleCopy = useCallback(() => {
    if (!activeCommand) return;
    copyToClipboard(activeCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Failed to copy installation command:", err);
    });
  }, [activeCommand]);

  if (!parsed) {
    // Fallback if not an installation block
    return null;
  }

  const tokens = highlight(activeCommand, "bash");

  return (
    <div className="docs-install-tabs">
      <div className="docs-install-header">
        <div className="docs-install-buttons" role="tablist">
          {(["npm", "yarn", "pnpm"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`docs-install-btn ${activeTab === tab ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCopied(false);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`docs-code-copy ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          aria-label="Copy install command"
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
      <div className="docs-install-body">
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
    </div>
  );
};

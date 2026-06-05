import React, { useState, useCallback } from "react";
import { highlight } from "./highlight";
import { parseInstallCode } from "./parseInstallCode";
import { copyToClipboard } from "../clipboard";
import { IconCheck, IconCopy } from "../icons/index";

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
    copyToClipboard(activeCommand)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
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

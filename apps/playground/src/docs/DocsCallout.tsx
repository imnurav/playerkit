import React from "react";
import { renderInline } from "./utils";

interface DocsCalloutProps {
  variant: string;
  text: string;
}

const CALLOUT_ICONS: Record<string, string> = {
  note: "ℹ",
  tip: "💡",
  warn: "⚠️",
  caution: "🚨",
};

export const DocsCallout: React.FC<DocsCalloutProps> = React.memo(
  ({ variant, text }) => {
    return (
      <div className={`docs-callout is-${variant}`}>
        <span className="docs-callout-icon">
          {CALLOUT_ICONS[variant] ?? "ℹ"}
        </span>
        <span className="docs-callout-text">{renderInline(text)}</span>
      </div>
    );
  },
);

DocsCallout.displayName = "DocsCallout";

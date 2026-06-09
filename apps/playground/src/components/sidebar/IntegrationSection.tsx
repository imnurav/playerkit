import { IconChevron, IconCode, IconShare } from "../../icons/index";
import type { IntegrationSectionProps } from "../../types";
import React from "react";

export const IntegrationSection: React.FC<IntegrationSectionProps> = React.memo(
  (props) => {
    const {
      onToggle,
      copiedCode,
      isExpanded,
      copiedShare,
      copyReactCode,
      copyShareLink,
    } = props;

    return (
      <section className="pg-section pg-actions-section">
        <div
          className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
          onClick={onToggle}
        >
          <h2 className="pg-section-title">Playground Integration</h2>
          <IconChevron className="pg-section-chevron" />
        </div>
        <div
          className={`pg-section-content ${isExpanded ? "is-expanded" : ""}`}
        >
          <div className="pg-section-inner">
            <div className="pg-action-buttons">
              <button
                type="button"
                onClick={copyReactCode}
                className="pg-outline-btn"
              >
                <IconCode />
                <span>{copiedCode ? "Copied Props!" : "Copy React Code"}</span>
              </button>
              <button
                type="button"
                onClick={copyShareLink}
                className="pg-outline-btn"
              >
                <IconShare />
                <span>{copiedShare ? "Copied Link!" : "Copy Custom URL"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

IntegrationSection.displayName = "IntegrationSection";

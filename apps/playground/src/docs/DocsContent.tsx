import React from "react";
import type { DocBlock, DocPackage } from "./content";
import { renderInline } from "./utils";
import { CodeBlock } from "./CodeBlock";
import { DocsTable } from "./DocsTable";
import { DocsCallout } from "./DocsCallout";

// ── Block renderer ──────────────────────────────────────────────────────────
export const BlockRenderer: React.FC<{ blocks: DocBlock[] }> = React.memo(
  ({ blocks }) => (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <p key={i} className="docs-text">
                {renderInline(block.text)}
              </p>
            );
          case "heading":
            if (block.level === 2)
              return (
                <h2 key={i} className="docs-h2">
                  {block.text}
                </h2>
              );
            if (block.level === 3)
              return (
                <h3 key={i} className="docs-h3">
                  {block.text}
                </h3>
              );
            return (
              <h4 key={i} className="docs-h4">
                {block.text}
              </h4>
            );
          case "code":
            return (
              <CodeBlock
                key={i}
                lang={block.lang}
                code={block.code}
                filename={block.filename}
              />
            );
          case "table":
            return (
              <DocsTable key={i} headers={block.headers} rows={block.rows} />
            );
          case "callout":
            return (
              <DocsCallout key={i} variant={block.variant} text={block.text} />
            );
          case "list":
            return (
              <ul key={i} className="docs-list">
                {block.items.map((item, li) => (
                  <li key={li}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "divider":
            return <hr key={i} className="docs-divider" />;
          default:
            return null;
        }
      })}
    </>
  ),
);

BlockRenderer.displayName = "BlockRenderer";

// ── DocsContent ─────────────────────────────────────────────────────────────
interface DocsContentProps {
  packages: DocPackage[];
  contentRef: React.RefObject<HTMLDivElement | null>;
  isSupported?: boolean;
  unsupportedVersion?: string;
}

export const DocsContent: React.FC<DocsContentProps> = React.memo(
  ({ packages, contentRef, isSupported = true, unsupportedVersion = "" }) => {
    const handleLoadLatest = () => {
      window.location.hash = "#/docs/v0.0.1";
    };

    return (
      <div className="docs-content-area" ref={contentRef}>
        <div className="docs-content-inner">
          {!isSupported ? (
            <div className="docs-not-found-card">
              <div className="docs-not-found-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="docs-not-found-title">
                Documentation Not Available
              </h1>
              <p className="docs-not-found-desc">
                We couldn't find documentation for version{" "}
                <strong className="docs-not-found-ver">
                  {unsupportedVersion}
                </strong>
                . We began publishing historical package documentation starting
                from version <strong>v0.0.1</strong>.
              </p>
              <p className="docs-not-found-hint">
                You can navigate to another version using the dropdown in the
                sidebar, or click the button below to load the latest
                documentation.
              </p>
              <button
                type="button"
                className="docs-not-found-btn"
                onClick={handleLoadLatest}
              >
                Load Latest Version (v0.0.1)
              </button>
            </div>
          ) : (
            packages.map((pkg) =>
              pkg.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="docs-section"
                >
                  <h1 className="docs-section-title">{section.title}</h1>
                  <BlockRenderer blocks={section.content} />
                </section>
              )),
            )
          )}
        </div>
      </div>
    );
  },
);

DocsContent.displayName = "DocsContent";

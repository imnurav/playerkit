import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { DocPackage, SearchEntry } from "./content";

const BADGE_COLORS: Record<string, string> = {
  react: "is-react",
  core: "is-core",
  ui: "is-ui",
};

const BADGE_EMOJI: Record<string, string> = {
  react: "⚛",
  core: "⚙",
  ui: "🎨",
};

interface DocsSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  packages: DocPackage[];
}

export const DocsSearch: React.FC<DocsSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  packages,
}) => {
  const [query, setQuery] = useState("");
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build index dynamically when packages change
  const searchIndex = useMemo(() => {
    const entries: SearchEntry[] = [];
    for (const pkg of packages) {
      for (const section of pkg.sections) {
        const texts: string[] = [section.title];
        for (const block of section.content) {
          if (block.type === "text") texts.push(block.text);
          else if (block.type === "heading") texts.push(block.text);
          else if (block.type === "code") texts.push(block.code);
          else if (block.type === "list") texts.push(...block.items);
          else if (block.type === "callout") texts.push(block.text);
          else if (block.type === "table") {
            for (const row of block.rows) texts.push(row.join(" "));
          }
        }
        entries.push({
          pkg: pkg.title,
          pkgId: pkg.id,
          sectionId: section.id,
          sectionTitle: section.title,
          text: texts.join(" ").toLowerCase(),
        });
      }
    }
    return entries;
  }, [packages]);

  // Reset query and focused index when modal is opened/closed
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setFocusedIdx(0);
    }
  }

  // Reset focused index when query changes
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setFocusedIdx(0);
  }

  // Derive search results from query and searchIndex
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return searchIndex.slice(0, 8);
    }
    return searchIndex
      .filter(
        (entry) =>
          entry.text.includes(q) ||
          entry.sectionTitle.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [query, searchIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, results.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        const entry = results[focusedIdx];
        if (entry) {
          onNavigate(entry.sectionId);
          onClose();
        }
      }
    },
    [results, focusedIdx, onNavigate, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="docs-search-overlay" onClick={onClose}>
      <div
        className="docs-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
      >
        {/* Input row */}
        <div className="docs-search-input-row">
          <svg
            className="docs-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="docs-search-input"
            placeholder="Search docs — props, hooks, classes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="docs-search-esc" onClick={onClose}>
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="docs-search-results" role="listbox">
          {results.length === 0 ? (
            <div className="docs-search-empty">
              No results for <strong>"{query}"</strong>
            </div>
          ) : (
            results.map((entry, idx) => (
              <div
                key={`${entry.pkgId}-${entry.sectionId}`}
                className={`docs-search-result ${idx === focusedIdx ? "is-focused" : ""}`}
                role="option"
                aria-selected={idx === focusedIdx}
                onClick={() => {
                  onNavigate(entry.sectionId);
                  onClose();
                }}
                onMouseEnter={() => setFocusedIdx(idx)}
              >
                <div
                  className={`docs-search-result-icon ${BADGE_COLORS[entry.pkgId] ?? ""}`}
                >
                  {BADGE_EMOJI[entry.pkgId] ?? "📄"}
                </div>
                <div className="docs-search-result-body">
                  <div className="docs-search-result-title">
                    {entry.sectionTitle}
                  </div>
                  <div className="docs-search-result-pkg">
                    @playerkit/{entry.pkgId}
                  </div>
                </div>
                <svg
                  className="docs-search-result-arrow"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="docs-search-footer">
          <span className="docs-search-footer-hint">
            <kbd className="docs-kbd">↑</kbd>
            <kbd className="docs-kbd">↓</kbd>
            Navigate
          </span>
          <span className="docs-search-footer-hint">
            <kbd className="docs-kbd">↵</kbd>
            Go
          </span>
          <span className="docs-search-footer-hint">
            <kbd className="docs-kbd">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};

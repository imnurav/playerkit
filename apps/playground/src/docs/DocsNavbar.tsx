import React from "react";

interface DocsNavbarProps {
  onSearchOpen: () => void;
  onMobileNavToggle: () => void;
  isMobileNavOpen: boolean;
  onBackToPlayground: () => void;
}

export const DocsNavbar: React.FC<DocsNavbarProps> = ({
  onSearchOpen,
  onMobileNavToggle,
  isMobileNavOpen,
  onBackToPlayground,
}) => {
  const isMac =
    typeof navigator !== "undefined" &&
    /mac/i.test(navigator.platform ?? navigator.userAgent);

  return (
    <nav className="docs-navbar">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="docs-nav-mobile-ham"
        onClick={onMobileNavToggle}
        aria-label="Toggle navigation"
      >
        {isMobileNavOpen ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        )}
      </button>

      {/* Logo */}
      <a
        href="#/"
        className="docs-nav-logo"
        onClick={onBackToPlayground}
        style={{ textDecoration: "none" }}
      >
        <div className="docs-nav-logo-mark">▶</div>
        <span>PlayerKit</span>
      </a>

      <div className="docs-nav-divider" />
      <span className="docs-nav-badge">Docs</span>

      <div className="docs-nav-spacer" />

      {/* Search trigger */}
      <button
        type="button"
        id="docs-search-trigger"
        className="docs-nav-search-trigger"
        onClick={onSearchOpen}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg
            width="14"
            height="14"
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
          Search docs…
        </span>
        <span className="docs-search-hint">
          <kbd className="docs-kbd">{isMac ? "⌘" : "Ctrl"}</kbd>
          <kbd className="docs-kbd">K</kbd>
        </span>
      </button>

      {/* Back to playground */}
      <button
        type="button"
        className="docs-nav-back"
        onClick={onBackToPlayground}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Playground</span>
      </button>
    </nav>
  );
};

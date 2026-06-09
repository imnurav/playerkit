import React from "react";
import {
  IconClose,
  IconMenu,
  IconSearch,
  IconChevronLeft,
} from "../icons/index";

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
          <IconClose width={18} height={18} />
        ) : (
          <IconMenu width={18} height={18} />
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
          <IconSearch />
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
        <IconChevronLeft width={14} height={14} />
        <span>Playground</span>
      </button>
    </nav>
  );
};

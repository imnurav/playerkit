import { IconClose, IconMenu, IconShare } from "../icons";
import React from "react";

interface MobileHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHudExpanded: boolean;
  setIsHudExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  copyShareLink: () => void;
  onOpenDocs?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = React.memo((props) => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isHudExpanded,
    setIsHudExpanded,
    copyShareLink,
    onOpenDocs,
  } = props;
  return (
    <header className="pg-mobile-header">
      {/* Left: Hamburger → opens Settings sidebar */}
      <button
        type="button"
        className={`pg-hamburger-btn ${isSidebarOpen ? "is-active" : ""}`}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label="Toggle Customization Panel"
        title="Settings"
      >
        {isSidebarOpen ? <IconClose /> : <IconMenu />}
      </button>

      {/* Center: Logo */}
      <div className="pg-mobile-logo">
        <span className="pg-logo-mark">▶</span>
        <span>HLS Playground</span>
      </div>

      {/* Right: Telemetry + Share */}
      <div className="pg-mobile-actions">
        <button
          type="button"
          className={`pg-mobile-hud-btn ${isHudExpanded ? "is-active" : ""}`}
          onClick={() => setIsHudExpanded((prev) => !prev)}
          title="Toggle Telemetry HUD"
          aria-label="Toggle Telemetry HUD"
        >
          {/* Bar chart icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
        {onOpenDocs && (
          <button
            type="button"
            className="pg-icon-btn"
            onClick={onOpenDocs}
            title="View Documentation"
            aria-label="View Documentation"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="pg-icon-btn"
          onClick={copyShareLink}
          title="Share Customized Player"
        >
          <IconShare />
        </button>
      </div>
    </header>
  );
});

MobileHeader.displayName = "MobileHeader";

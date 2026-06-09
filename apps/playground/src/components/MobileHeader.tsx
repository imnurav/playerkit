import type { MobileHeaderProps } from "../types";
import React from "react";
import {
  IconClose,
  IconMenu,
  IconShare,
  IconBarChart,
  IconBook,
} from "../icons/index";

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
        <span>PlayerKit Playground</span>
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
          <IconBarChart width={18} height={18} />
        </button>
        {onOpenDocs && (
          <button
            type="button"
            className="pg-icon-btn"
            onClick={onOpenDocs}
            title="View Documentation"
            aria-label="View Documentation"
          >
            <IconBook width={16} height={16} />
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

import React from "react";
import { IconClose, IconMenu, IconShare } from "../icons";

interface MobileHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  copyShareLink: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = React.memo(
  ({ isSidebarOpen, setIsSidebarOpen, copyShareLink }) => {
    return (
      <header className="pg-mobile-header">
        <button
          type="button"
          className={`pg-hamburger-btn ${isSidebarOpen ? "is-active" : ""}`}
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label="Toggle Customization Panel"
        >
          {isSidebarOpen ? <IconClose /> : <IconMenu />}
        </button>
        <div className="pg-mobile-logo">
          <span className="pg-logo-mark">▶</span>
          <span>HLS Playground</span>
        </div>
        <div className="pg-mobile-actions">
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
  },
);

MobileHeader.displayName = "MobileHeader";

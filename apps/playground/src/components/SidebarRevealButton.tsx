import React from "react";
import { IconChevronRight } from "../icons";

interface SidebarRevealButtonProps {
  accentColor: string;
  onClick: () => void;
}

export const SidebarRevealButton: React.FC<SidebarRevealButtonProps> =
  React.memo(({ accentColor, onClick }) => {
    return (
      <button
        type="button"
        className="pg-sidebar-reveal-btn"
        onClick={onClick}
        title="Open Customizer Panel"
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        <IconChevronRight />
        <span>SETTINGS</span>
      </button>
    );
  });

SidebarRevealButton.displayName = "SidebarRevealButton";

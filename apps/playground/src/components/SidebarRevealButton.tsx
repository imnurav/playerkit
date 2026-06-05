import { IconChevronRight } from "../icons/index";
import React from "react";

interface SidebarRevealButtonProps {
  onClick: () => void;
}

export const SidebarRevealButton: React.FC<SidebarRevealButtonProps> =
  React.memo((props) => {
    const { onClick } = props;
    return (
      <button
        type="button"
        className="pg-sidebar-reveal-btn"
        onClick={onClick}
        title="Open Customizer Panel"
      >
        <IconChevronRight />
        <span>SETTINGS</span>
      </button>
    );
  });

SidebarRevealButton.displayName = "SidebarRevealButton";

import type { SidebarRevealButtonProps } from "../types";
import { IconChevronRight } from "../icons/index";
import React from "react";

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

import type { HudRevealButtonProps } from "../types";
import { IconBarChart } from "../icons/index";
import React from "react";

export const HudRevealButton: React.FC<HudRevealButtonProps> = React.memo(
  (props) => {
    const { onClick } = props;
    return (
      <button
        type="button"
        className="pg-hud-reveal-btn"
        onClick={onClick}
        title="Open Telemetry HUD"
      >
        <span>TELEMETRY</span>
        <IconBarChart />
      </button>
    );
  },
);

HudRevealButton.displayName = "HudRevealButton";

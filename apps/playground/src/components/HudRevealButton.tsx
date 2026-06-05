import React from "react";
import { IconBarChart } from "../icons/index";

interface HudRevealButtonProps {
  onClick: () => void;
}

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

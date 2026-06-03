import React from "react";

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
        <svg
          width="15"
          height="15"
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
    );
  },
);

HudRevealButton.displayName = "HudRevealButton";

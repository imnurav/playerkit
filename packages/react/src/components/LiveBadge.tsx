import type { LiveBadgeProps } from "../types";
import { memo } from "react";

export const LiveBadge = memo(function LiveBadge(props: LiveBadgeProps) {
  const { isLive, hasError, isAtLiveEdge, controlsVisible, onSeekToLive } =
    props;
  if (!isLive || hasError || isAtLiveEdge) return null;

  return (
    <button
      type="button"
      className={`pk-seek-to-live${!controlsVisible ? " pk-seek-to-live--hidden" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSeekToLive();
      }}
      aria-label="Go to live"
    >
      <span className="pk-live-dot" />
      Go Live
    </button>
  );
});

LiveBadge.displayName = "LiveBadge";

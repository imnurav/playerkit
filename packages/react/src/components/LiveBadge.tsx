import type { LiveBadgeProps } from "../types";
import { memo } from "react";

export const LiveBadge = memo(function LiveBadge(props: LiveBadgeProps) {
  const { isLive, hasError, isAtLiveEdge, controlsVisible, onSeekToLive } =
    props;
  if (!isLive || hasError) return null;

  return (
    <button
      type="button"
      className={`pk-seek-to-live${isAtLiveEdge ? " pk-seek-to-live--live" : ""}${!controlsVisible ? " pk-seek-to-live--hidden" : ""
        }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isAtLiveEdge) {
          onSeekToLive();
        }
      }}
      aria-label={isAtLiveEdge ? "Live" : "Go to live"}
    >
      <span className="pk-live-dot" />
      {isAtLiveEdge ? "LIVE" : "Go Live"}
    </button>
  );
});

LiveBadge.displayName = "LiveBadge";

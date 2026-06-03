import type { LiveBadgeProps } from "../types";
import { memo } from "react";

export const LiveBadge = memo(function LiveBadge(props: LiveBadgeProps) {
  const { isLive, hasError, isAtLiveEdge, controlsVisible, onSeekToLive } =
    props;
  if (!isLive || hasError) return null;

  return (
    <button
      type="button"
      className={`vp-seek-to-live${isAtLiveEdge ? " vp-seek-to-live--live" : ""}${
        !controlsVisible ? " vp-seek-to-live--hidden" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isAtLiveEdge) {
          onSeekToLive();
        }
      }}
      aria-label={isAtLiveEdge ? "Live" : "Go to live"}
    >
      <span className="vp-live-dot" />
      {isAtLiveEdge ? "LIVE" : "Go Live"}
    </button>
  );
});

LiveBadge.displayName = "LiveBadge";

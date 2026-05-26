import { memo } from "react";

export type LiveBadgeProps = {
  isLive: boolean;
  hasError: boolean;
  isAtLiveEdge: boolean;
  controlsVisible: boolean;
  onSeekToLive: () => void;
};

export const LiveBadge = memo(function LiveBadge({
  isLive,
  hasError,
  isAtLiveEdge,
  controlsVisible,
  onSeekToLive,
}: LiveBadgeProps) {
  if (!isLive || hasError) return null;

  return (
    <button
      type="button"
      className={`vp-seek-to-live${isAtLiveEdge ? " vp-seek-to-live--live" : ""}${!controlsVisible ? " vp-seek-to-live--hidden" : ""
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

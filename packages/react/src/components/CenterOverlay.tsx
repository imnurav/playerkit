import { IconPlay, IconPause, IconRewind, IconForward } from "@playerkit/ui";
import type { CenterOverlayProps } from "../types";
import type { CSSProperties } from "react";
import { memo } from "react";

export const CenterOverlay = memo(function CenterOverlay(
  props: CenterOverlayProps,
) {
  const {
    onSeek,
    isMobile,
    hasError,
    seekStep,
    isPlaying,
    isBuffering = false,
    onPlayToggle,
    centerOverlayGap,
    showCenterOverlay,
    isLive = false,
    dvr = true,
  } = props;
  if (isMobile || hasError || !showCenterOverlay) return null;

  const showSeekButtons = !(isLive && !dvr);

  return (
    <div
      className="pk-center-overlay"
      style={
        centerOverlayGap
          ? ({ gap: `${centerOverlayGap}px` } as CSSProperties)
          : undefined
      }
    >
      {showSeekButtons && (
        <button
          type="button"
          className="pk-center-btn pk-center-btn--seek"
          aria-label={`Seek backward ${seekStep} seconds`}
          onClick={(e) => {
            e.stopPropagation();
            onSeek(-1);
          }}
        >
          <IconRewind />
        </button>
      )}

      <button
        type="button"
        className="pk-center-btn pk-center-btn--play"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={(e) => {
          e.stopPropagation();
          onPlayToggle();
        }}
        style={
          isBuffering
            ? { visibility: "hidden", pointerEvents: "none" }
            : undefined
        }
      >
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>

      {showSeekButtons && (
        <button
          type="button"
          className="pk-center-btn pk-center-btn--seek"
          aria-label={`Seek forward ${seekStep} seconds`}
          onClick={(e) => {
            e.stopPropagation();
            onSeek(1);
          }}
        >
          <IconForward />
        </button>
      )}
    </div>
  );
});

CenterOverlay.displayName = "CenterOverlay";

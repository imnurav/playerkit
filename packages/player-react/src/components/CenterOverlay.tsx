import { IconPlay, IconPause, IconRewind, IconForward } from "@nurav/player-ui";
import type { CSSProperties } from "react";
import { memo } from "react";

export type CenterOverlayProps = {
  seekStep: number;
  isMobile: boolean;
  hasError: boolean;
  isPlaying: boolean;
  controlsVisible: boolean;
  onPlayToggle: () => void;
  centerOverlayGap?: number;
  showCenterOverlay: boolean;
  onSeek: (direction: -1 | 1) => void;
};

export const CenterOverlay = memo(function CenterOverlay({
  onSeek,
  isMobile,
  hasError,
  seekStep,
  isPlaying,
  onPlayToggle,
  centerOverlayGap,
  showCenterOverlay,
}: CenterOverlayProps) {
  if (isMobile || hasError || !showCenterOverlay) return null;

  return (
    <div
      className="vp-center-overlay"
      style={
        centerOverlayGap
          ? ({ gap: `${centerOverlayGap}px` } as CSSProperties)
          : undefined
      }
    >
      <button
        type="button"
        className="vp-center-btn vp-center-btn--seek"
        aria-label={`Seek backward ${seekStep} seconds`}
        onClick={(e) => {
          e.stopPropagation();
          onSeek(-1);
        }}
      >
        <IconRewind />
      </button>

      <button
        type="button"
        className="vp-center-btn vp-center-btn--play"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={(e) => {
          e.stopPropagation();
          onPlayToggle();
        }}
      >
        {isPlaying ? <IconPause /> : <IconPlay />}
      </button>

      <button
        type="button"
        className="vp-center-btn vp-center-btn--seek"
        aria-label={`Seek forward ${seekStep} seconds`}
        onClick={(e) => {
          e.stopPropagation();
          onSeek(1);
        }}
      >
        <IconForward />
      </button>
    </div>
  );
});

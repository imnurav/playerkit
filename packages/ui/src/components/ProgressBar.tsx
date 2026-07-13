import { useState, useRef, useCallback } from "react";
import type { ProgressBarProps } from "../types";
import { formatPlayerTime } from "../format";

export function ProgressBar(props: ProgressBarProps) {
  const {
    buffered,
    progress,
    duration,
    currentTime,
    player,
    state,
    className = "",
  } = props;

  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // For live streams, use seekable range for the slider only if DVR is enabled
  const isLive = state?.isLive ?? false;
  const seekableStart = state?.seekableStart ?? 0;
  const seekableEnd = state?.seekableEnd ?? 0;
  const hasSeekableRange =
    isLive && !!state?.dvr && seekableEnd > seekableStart;
  const isDisabled = isLive && !state?.dvr;

  const sliderMin = hasSeekableRange ? seekableStart : 0;
  const sliderMax = hasSeekableRange
    ? seekableEnd
    : isDisabled
      ? 100
      : duration || 0;
  const sliderValue = hasSeekableRange
    ? Math.max(currentTime, seekableStart)
    : isDisabled
      ? sliderMax
      : currentTime || 0;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDisabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      setHoverPosition(percent);
    },
    [isDisabled]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  let tooltipTime = 0;
  if (hoverPosition !== null) {
    tooltipTime = sliderMin + hoverPosition * (sliderMax - sliderMin);
  }

  return (
    <div
      ref={containerRef}
      className={`pk-progress ${isDisabled ? "pk-progress--disabled" : ""} ${className}`.trim()}
      style={isDisabled ? { pointerEvents: "none" } : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="pk-progress__track" aria-hidden="true">
        <div
          className="pk-progress__buffered"
          style={{ inlineSize: `${buffered}%` }}
        />
        <div
          className="pk-progress__filled"
          style={{ inlineSize: `${progress}%` }}
        />
      </div>
      
      {hoverPosition !== null && (
        <div 
          className="pk-progress__tooltip" 
          style={{ left: `${hoverPosition * 100}%` }}
        >
          {formatPlayerTime(tooltipTime)}
        </div>
      )}

      <input
        aria-label="Seek"
        type="range"
        min={sliderMin}
        max={sliderMax}
        step="0.01"
        value={sliderValue}
        disabled={isDisabled}
        onChange={(event) => player?.seek(Number(event.target.value))}
      />
    </div>
  );
}

import type { ProgressBarProps } from "../types";

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

  return (
    <div
      className={`pk-progress ${isDisabled ? "pk-progress--disabled" : ""} ${className}`.trim()}
      style={isDisabled ? { pointerEvents: "none" } : undefined}
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

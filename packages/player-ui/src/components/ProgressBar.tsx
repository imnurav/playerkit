import type { Player, PlayerSnapshot } from "@varun/player-core";

export type ProgressBarProps = {
  buffered: number;
  progress: number;
  duration: number;
  className?: string;
  currentTime: number;
  player: Player | null;
  state?: PlayerSnapshot | null;
};

export function ProgressBar({
  buffered,
  progress,
  duration,
  currentTime,
  player,
  state,
  className = "",
}: ProgressBarProps) {
  // For live streams, use seekable range for the slider
  const isLive = state?.isLive ?? false;
  const seekableStart = state?.seekableStart ?? 0;
  const seekableEnd = state?.seekableEnd ?? 0;
  const hasSeekableRange = isLive && seekableEnd > seekableStart;

  const sliderMin = hasSeekableRange ? seekableStart : 0;
  const sliderMax = hasSeekableRange ? seekableEnd : duration || 0;
  const sliderValue = hasSeekableRange
    ? Math.max(currentTime, seekableStart)
    : currentTime || 0;

  return (
    <div className={`vp-progress ${className}`.trim()}>
      <div className="vp-progress__track" aria-hidden="true">
        <div
          className="vp-progress__buffered"
          style={{ inlineSize: `${buffered}%` }}
        />
        <div
          className="vp-progress__filled"
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
        onChange={(event) => player?.seek(Number(event.target.value))}
      />
    </div>
  );
}

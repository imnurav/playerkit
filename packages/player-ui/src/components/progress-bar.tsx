import type { Player } from "@varun/player-core";

export type ProgressBarProps = {
  buffered: number;
  progress: number;
  duration: number;
  currentTime: number;
  player: Player | null;
  className?: string;
};

export function ProgressBar({
  buffered,
  progress,
  duration,
  currentTime,
  player,
  className = "",
}: ProgressBarProps) {
  return (
    <div className={`vhp-progress ${className}`.trim()}>
      <div className="vhp-progress-track" aria-hidden="true">
        <div
          className="vhp-progress-loaded"
          style={{ inlineSize: `${buffered}%` }}
        />
        <div
          className="vhp-progress-played"
          style={{ inlineSize: `${progress}%` }}
        />
      </div>
      <input
        aria-label="Seek"
        type="range"
        min={0}
        max={duration || 0}
        step="0.01"
        value={currentTime || 0}
        onChange={(event) => player?.seek(Number(event.target.value))}
      />
    </div>
  );
}

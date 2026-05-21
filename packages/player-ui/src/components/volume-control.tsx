import type { Player, PlayerSnapshot } from "@varun/player-core";
import { usePlayerIcons } from "../icons";

export type VolumeControlProps = {
  player: Player | null;
  state: PlayerSnapshot | null;
  className?: string;
};

export function VolumeControl({
  player,
  state,
  className = "",
}: VolumeControlProps) {
  const { Volume, VolumeOff } = usePlayerIcons();
  const isVertical = className.includes("vp-volume--vertical");

  const muteButton = (
    <button
      type="button"
      className="vp-icon-button"
      aria-label={state?.isMuted ? "Unmute" : "Mute"}
      onClick={() => (state?.isMuted ? player?.unmute() : player?.mute())}
    >
      {state?.isMuted || state?.volume === 0 ? <VolumeOff /> : <Volume />}
    </button>
  );

  const slider = (
    <input
      aria-label="Volume"
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={state?.isMuted ? 0 : state?.volume || 0}
      onChange={(event) => player?.setVolume(Number(event.target.value))}
    />
  );

  if (isVertical) {
    return (
      <div
        className="vp-volume vp-volume--vertical"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {muteButton}
        <div className="vp-volume__popup">
          <div className="vp-volume__slider-track">{slider}</div>
        </div>
      </div>
    );
  }

  return (
    <label className={`vp-volume ${className}`.trim()} aria-label="Volume">
      {muteButton}
      {slider}
    </label>
  );
}

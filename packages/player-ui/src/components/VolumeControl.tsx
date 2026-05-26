import type { Player, PlayerSnapshot } from "@nurav/player-core";
import { usePlayerIcons } from "../icons";

export type VolumeControlProps = {
  player: Player | null;
  state: PlayerSnapshot | null;
  className?: string;
};

function getVolumeIcon(volume: number, isMuted: boolean) {
  if (isMuted || volume === 0) return "VolumeOff";
  if (volume < 0.5) return "VolumeLow";
  return "VolumeHigh";
}

export function VolumeControl({
  player,
  state,
  className = "",
}: VolumeControlProps) {
  const icons = usePlayerIcons();
  const isVertical = className.includes("vp-volume--vertical");

  const vol = state?.isMuted ? 0 : state?.volume || 0;
  const iconKey = getVolumeIcon(vol, !!state?.isMuted);
  const VolumeIcon = icons[iconKey as keyof typeof icons] as
    | React.ComponentType<{ className?: string }>
    | undefined;

  const muteButton = (
    <button
      type="button"
      className="vp-icon-button"
      aria-label={state?.isMuted ? "Unmute" : "Mute"}
      onClick={() => (state?.isMuted ? player?.unmute() : player?.mute())}
    >
      {VolumeIcon ? <VolumeIcon /> : null}
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

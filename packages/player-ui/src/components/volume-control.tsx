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

  return (
    <label className={`vhp-volume ${className}`.trim()} aria-label="Volume">
      <button
        type="button"
        className="vhp-icon-button"
        aria-label={state?.isMuted ? "Unmute" : "Mute"}
        onClick={() => (state?.isMuted ? player?.unmute() : player?.mute())}
      >
        {state?.isMuted || state?.volume === 0 ? <VolumeOff /> : <Volume />}
      </button>
      <input
        aria-label="Volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={state?.isMuted ? 0 : state?.volume || 0}
        onChange={(event) => player?.setVolume(Number(event.target.value))}
      />
    </label>
  );
}

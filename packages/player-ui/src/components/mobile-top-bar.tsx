import type { Player, PlayerSnapshot } from "@varun/player-core";
import { usePlayerIcons } from "../icons";

export type MobileTopBarProps = {
  player: Player | null;
  state: PlayerSnapshot | null;
  onOpenSettings: () => void;
  controlsVisible?: boolean;
};

export function MobileTopBar({
  player,
  state,
  onOpenSettings,
  controlsVisible = true,
}: MobileTopBarProps) {
  const { Settings, Maximize, Minimize } = usePlayerIcons();

  return (
    <div
      className="vhp-top-controls"
      data-top-controls-visible={controlsVisible}
    >
      <div className="vhp-top-controls-right">
        <button
          type="button"
          className="vhp-icon-button-top"
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <Settings />
        </button>
        <button
          type="button"
          className="vhp-icon-button-top"
          aria-label={
            state?.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
          }
          onClick={() => void player?.toggleFullscreen()}
        >
          {state?.isFullscreen ? <Minimize /> : <Maximize />}
        </button>
      </div>
    </div>
  );
}
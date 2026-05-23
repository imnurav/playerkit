import { IconFitContain, IconFitCover, IconFitFill } from "../icons";
import type { Player, PlayerSnapshot } from "@nurav/player-core";
import type { PlayerCustomization } from "../themes/types";
import { usePlayerIcons } from "../icons";

export type MobileTopBarProps = {
  player: Player | null;
  state: PlayerSnapshot | null;
  onOpenSettings: () => void;
  controlsVisible?: boolean;
  customization?: PlayerCustomization;
  objectFit?: "contain" | "cover" | "fill";
  onObjectFitChange?: (fit: "contain" | "cover" | "fill") => void;
};

export function MobileTopBar({
  player,
  state,
  onOpenSettings,
  controlsVisible = true,
  customization,
  objectFit = "contain",
  onObjectFitChange,
}: MobileTopBarProps) {
  const { Settings, Maximize, Minimize } = usePlayerIcons();

  const showSettings = customization?.showSettings ?? true;
  const showFullscreen = customization?.showFullscreen ?? true;
  const showFitBtn =
    (customization?.showObjectFitButton ?? true) && !!onObjectFitChange;

  return (
    <div
      className="vp-top-controls"
      data-top-controls-visible={controlsVisible}
    >
      {/* Live indicator — top left */}
      {state?.isLive && (
        <div className="vp-live-top">
          <span className="vp-live-dot" />
          <span className="vp-live-label">Live</span>
        </div>
      )}

      <div className="vp-top-controls__right">
        {showFitBtn && (
          <button
            type="button"
            className="vp-icon-button-top"
            aria-label={`Video fit: ${objectFit}`}
            title={`Video fit: ${objectFit}`}
            onClick={() => {
              const modes: Array<"contain" | "cover" | "fill"> = [
                "contain",
                "cover",
                "fill",
              ];
              const idx = modes.indexOf(objectFit);
              onObjectFitChange!(modes[(idx + 1) % modes.length]);
            }}
          >
            {objectFit === "contain" && <IconFitContain />}
            {objectFit === "cover" && <IconFitCover />}
            {objectFit === "fill" && <IconFitFill />}
          </button>
        )}
        {showSettings && (
          <button
            type="button"
            className="vp-icon-button-top"
            aria-label="Settings"
            onClick={onOpenSettings}
          >
            <Settings />
          </button>
        )}
        {showFullscreen && (
          <button
            type="button"
            className="vp-icon-button-top"
            aria-label={
              state?.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
            }
            onClick={() => void player?.toggleFullscreen()}
          >
            {state?.isFullscreen ? <Minimize /> : <Maximize />}
          </button>
        )}
      </div>
    </div>
  );
}

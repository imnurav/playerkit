import { IconFitContain, IconFitCover, IconFitFill } from "../icons";
import type { MobileTopBarProps } from "../types";
import { usePlayerIcons } from "../icons";

export function MobileTopBar(props: MobileTopBarProps) {
  const {
    state,
    player,
    customization,
    onOpenSettings,
    onObjectFitChange,
    objectFit = "contain",
    controlsVisible = true,
  } = props;

  const { Settings, Maximize, Minimize } = usePlayerIcons();

  const showSettings = customization?.showSettings ?? true;
  const showFullscreen = customization?.showFullscreen ?? true;
  const showFitBtn =
    (customization?.showObjectFitButton ?? true) && !!onObjectFitChange;

  return (
    <div
      className="pk-top-controls"
      data-top-controls-visible={controlsVisible}
    >
      {/* Live indicator — top left */}
      {state?.isLive && (
        <div
          className={`pk-live-top${
            state.isAtLiveEdge ? " pk-live-top--live" : ""
          }`}
        >
          <span className="pk-live-dot" />
          <span className="pk-live-label">Live</span>
        </div>
      )}

      <div className="pk-top-controls__right">
        {showFitBtn && (
          <button
            type="button"
            className="pk-icon-button-top"
            aria-label={`Video fit: ${objectFit}`}
            title={`Video fit: ${objectFit}`}
            onClick={() => {
              const modes: Array<"contain" | "cover" | "fill"> = [
                "contain",
                "cover",
                "fill",
              ];
              const idx = modes.indexOf(objectFit);
              const nextMode = modes[(idx + 1) % modes.length] ?? "contain";
              onObjectFitChange!(nextMode);
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
            className="pk-icon-button-top"
            aria-label="Settings"
            onClick={onOpenSettings}
          >
            <Settings />
          </button>
        )}
        {showFullscreen && (
          <button
            type="button"
            className="pk-icon-button-top"
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

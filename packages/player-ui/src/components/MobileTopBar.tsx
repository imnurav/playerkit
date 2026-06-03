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

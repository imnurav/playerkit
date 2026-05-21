import { VolumeControl } from "../../components/volume-control";
import { SettingsPanel } from "../../components/settings-panel";
import { MobileTopBar } from "../../components/mobile-top-bar";
import { ProgressBar } from "../../components/progress-bar";
import { TimeDisplay } from "../../components/time-display";
import type { ThemeControlProps } from "../registry";
import { usePlayerIcons } from "../../icons";
import { useRef, useState } from "react";

export function PrimeControls({
  state,
  player,
  buffered,
  isMobile,
  progress,
  seekRelative,
  playbackRates,
  controlsVisible,
  onSettingsOpenChange,
  onControlsInteraction,
}: ThemeControlProps) {
  const [showSettings, setShowSettings] = useState(false);
  const gearRef = useRef<HTMLButtonElement>(null);
  const { Play, Pause, Rewind, Forward, Settings, Maximize, Minimize } =
    usePlayerIcons();

  const openSettings = () => {
    setShowSettings(true);
    onSettingsOpenChange?.(true);
  };
  const closeSettings = () => {
    setShowSettings(false);
    onSettingsOpenChange?.(false);
  };

  return (
    <>
      {isMobile && (
        <MobileTopBar
          player={player}
          state={state}
          onOpenSettings={openSettings}
          controlsVisible={controlsVisible}
        />
      )}

      <div
        className="vhp-controls vhp-controls-prime"
        data-vhp-controls
        onPointerEnter={onControlsInteraction}
      >
        <ProgressBar
          buffered={buffered}
          progress={progress}
          duration={state?.duration || 0}
          currentTime={state?.currentTime || 0}
          player={player}
        />

        <div className="vhp-control-row">
          <button
            type="button"
            className="vhp-icon-button vhp-main-action"
            aria-label={state?.isPlaying ? "Pause" : "Play"}
            onClick={() => void player?.togglePlay()}
          >
            {state?.isPlaying ? <Pause /> : <Play />}
          </button>

          {!isMobile && (
            <>
              <button
                type="button"
                className="vhp-icon-button"
                aria-label="Seek backward"
                onClick={() => seekRelative(-1)}
              >
                <Rewind />
              </button>
              <button
                type="button"
                className="vhp-icon-button"
                aria-label="Seek forward"
                onClick={() => seekRelative(1)}
              >
                <Forward />
              </button>
            </>
          )}

          <TimeDisplay
            currentTime={state?.currentTime || 0}
            duration={state?.duration || 0}
          />

          {!isMobile && state && (
            <span className="vhp-loaded">{Math.round(buffered)}% loaded</span>
          )}

          <div className="vhp-spacer" />

          {!isMobile && (
            <>
              <VolumeControl player={player} state={state} />
              <div className="vhp-settings-anchor">
                <button
                  ref={gearRef}
                  type="button"
                  className="vhp-icon-button"
                  aria-label="Settings"
                  onClick={() =>
                    showSettings ? closeSettings() : openSettings()
                  }
                >
                  <Settings />
                </button>
                {showSettings && (
                  <SettingsPanel
                    playbackRates={playbackRates}
                    player={player}
                    state={state}
                    onClose={closeSettings}
                    isMobile={false}
                    themeClass="vhp-settings-dropdown-prime"
                    mode="dropdown"
                    triggerRef={gearRef}
                    controlsVisible={controlsVisible}
                  />
                )}
              </div>
            </>
          )}

          {!isMobile && (
            <button
              type="button"
              className="vhp-icon-button"
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

      {showSettings && isMobile && (
        <SettingsPanel
          playbackRates={playbackRates}
          player={player}
          state={state}
          onClose={closeSettings}
          isMobile={true}
          themeClass="vhp-settings-sheet-prime"
          mode="sheet"
          controlsVisible={controlsVisible}
        />
      )}
    </>
  );
}

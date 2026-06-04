import { IconFitContain, IconFitCover, IconFitFill } from "./icons";
import type { PlayerControlsProps, ControlRowProps } from "./types";
import { PlayerIconProvider, usePlayerIcons } from "./icons";
import { VolumeControl } from "./components/VolumeControl";
import { SettingsPanel } from "./components/SettingsPanel";
import { MobileTopBar } from "./components/MobileTopBar";
import { ProgressBar } from "./components/ProgressBar";
import { TimeDisplay } from "./components/TimeDisplay";
import type { ControlsLayout } from "./themes/types";
import { getThemeConfig } from "./themes/configs";
import { memo, useRef, useState } from "react";

/**
 * Unified player controls — single component driven by theme config.
 * Supports both stacked (progress above) and inline (single-row) layouts.
 * All elements can be toggled via the `customization` prop.
 */
export const PlayerControls = memo(function PlayerControls(
  props: PlayerControlsProps,
) {
  const {
    buffered,
    onControlsInteraction,
    onSettingsOpenChange,
    playbackRates,
    player,
    progress,
    seekRelative,
    state,
    theme = "kgs",
    isMobile,
    controlsVisible,
    customization,
    objectFit,
    onObjectFitChange,
  } = props;

  const themeConfig = getThemeConfig(theme);
  const layout: ControlsLayout = isMobile
    ? themeConfig.controls.mobile
    : themeConfig.controls.desktop;
  const [showSettings, setShowSettings] = useState(false);
  const gearRef = useRef<HTMLButtonElement>(null);

  const openSettings = () => {
    setShowSettings(true);
    onSettingsOpenChange?.(true);
  };
  const closeSettings = () => {
    setShowSettings(false);
    onSettingsOpenChange?.(false);
  };

  const progressBar = (
    <ProgressBar
      buffered={buffered}
      progress={progress}
      duration={state?.duration || 0}
      currentTime={state?.currentTime || 0}
      player={player}
      state={state}
    />
  );

  const isInline = layout.progressPosition === "inline";

  return (
    <PlayerIconProvider>
      {isMobile && (
        <MobileTopBar
          player={player}
          state={state}
          onOpenSettings={() => {
            if (!showSettings) openSettings();
          }}
          controlsVisible={controlsVisible}
          customization={customization}
          objectFit={objectFit}
          onObjectFitChange={onObjectFitChange}
        />
      )}

      <div
        className={layout.controlsClassName}
        data-vp-controls
        onPointerEnter={onControlsInteraction}
      >
        {/* Stacked layout: progress bar on its own row above buttons */}
        {!isInline && progressBar}

        <ControlRow
          state={state}
          player={player}
          layout={layout}
          gearRef={gearRef}
          isMobile={isMobile}
          objectFit={objectFit}
          seekRelative={seekRelative}
          showSettings={showSettings}
          openSettings={openSettings}
          playbackRates={playbackRates}
          closeSettings={closeSettings}
          customization={customization}
          onObjectFitChange={onObjectFitChange}
          progressBar={isInline ? progressBar : null}
        />
      </div>

      {showSettings && isMobile && (
        <SettingsPanel
          state={state}
          themeClass=""
          player={player}
          isMobile={true}
          mode="sheet"
          onClose={closeSettings}
          playbackRates={playbackRates}
        />
      )}
    </PlayerIconProvider>
  );
});

PlayerControls.displayName = "PlayerControls";

// ─── Internal Control Row ────────────────────────────────────────────────────

const ControlRow = memo(function ControlRow(props: ControlRowProps) {
  const {
    state,
    player,
    layout,
    gearRef,
    isMobile,
    progressBar,
    seekRelative,
    showSettings,
    openSettings,
    playbackRates,
    closeSettings,
    customization,
    objectFit = "contain",
    onObjectFitChange,
  } = props;

  const { Play, Pause, Rewind, Forward, Settings, Maximize, Minimize } =
    usePlayerIcons();

  // Resolve customization with defaults
  // On mobile: play handled by tap, settings/fullscreen/fit in top bar
  const showPlayBtn = isMobile
    ? false
    : (customization?.showPlayButton ?? false);
  const showTime = customization?.showTimeDisplay ?? true;
  const showSettingsBtn = isMobile
    ? false
    : (customization?.showSettings ?? true);
  const showFullscreen = isMobile
    ? false
    : (customization?.showFullscreen ?? true);
  const showFitBtn = isMobile
    ? false
    : (customization?.showObjectFitButton ?? true);
  const volumeMode =
    customization?.volumeControl ??
    (layout.showVolume ? "horizontal" : "hidden");

  return (
    <div className="vp-control-row">
      {/* Play / Pause */}
      {showPlayBtn && (
        <button
          type="button"
          className="vp-icon-button vp-icon-button--primary"
          aria-label={state?.isPlaying ? "Pause" : "Play"}
          onClick={() => void player?.togglePlay()}
        >
          {state?.isPlaying ? <Pause /> : <Play />}
        </button>
      )}

      {/* Seek buttons — only when layout enables them */}
      {!isMobile && layout.showSeekButtons && (
        <>
          <button
            type="button"
            className="vp-icon-button"
            aria-label="Seek backward"
            onClick={() => seekRelative(-1)}
          >
            <Rewind />
          </button>
          <button
            type="button"
            className="vp-icon-button"
            aria-label="Seek forward"
            onClick={() => seekRelative(1)}
          >
            <Forward />
          </button>
        </>
      )}

      {/* Inline progress bar — takes remaining space */}
      {progressBar && <div className="vp-progress-inline">{progressBar}</div>}

      {/* Time display */}
      {showTime && (
        <TimeDisplay
          isLive={state?.isLive}
          duration={state?.duration || 0}
          currentTime={state?.currentTime || 0}
        />
      )}

      {/* Live badge removed from control row — shown as floating overlay instead */}

      {/* Spacer — only in stacked layout; inline layout uses flex-grow on progress */}
      {!progressBar && <div className="vp-spacer" />}

      {/* Volume — horizontal, vertical, or hidden */}
      {!isMobile && volumeMode === "horizontal" && (
        <VolumeControl player={player} state={state} />
      )}
      {!isMobile && volumeMode === "vertical" && (
        <VolumeControl
          state={state}
          player={player}
          className="vp-volume--vertical"
        />
      )}

      {/* Settings */}
      {showSettingsBtn && (
        <div className="vp-settings-anchor">
          <button
            ref={gearRef}
            type="button"
            aria-label="Settings"
            className="vp-icon-button"
            onClick={() => {
              if (!showSettings) openSettings();
            }}
          >
            <Settings />
          </button>
          {showSettings && !isMobile && (
            <SettingsPanel
              state={state}
              themeClass=""
              player={player}
              mode="dropdown"
              isMobile={false}
              onClose={closeSettings}
              playbackRates={playbackRates}
            />
          )}
        </div>
      )}

      {/* Video Fit Toggle */}
      {showFitBtn && onObjectFitChange && (
        <button
          type="button"
          className="vp-icon-button"
          aria-label={`Video fit: ${objectFit}`}
          title={`Video fit: ${objectFit}`}
          onClick={() => {
            const modes: Array<"contain" | "cover" | "fill"> = [
              "contain",
              "cover",
              "fill",
            ];
            const idx = modes.indexOf(objectFit);
            onObjectFitChange(modes[(idx + 1) % modes.length]);
          }}
        >
          {objectFit === "contain" && <IconFitContain />}
          {objectFit === "cover" && <IconFitCover />}
          {objectFit === "fill" && <IconFitFill />}
        </button>
      )}

      {/* Fullscreen */}
      {showFullscreen && (
        <button
          type="button"
          className="vp-icon-button"
          aria-label={
            state?.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
          }
          onClick={() => void player?.toggleFullscreen()}
        >
          {state?.isFullscreen ? <Minimize /> : <Maximize />}
        </button>
      )}
    </div>
  );
});

ControlRow.displayName = "ControlRow";

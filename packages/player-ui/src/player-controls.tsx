import { useState } from "react";

import type { Player, PlayerSnapshot } from "@varun/player-core";
import type { PlayerControlsLayoutPreset } from "@varun/player-themes";

import {
  IconForward,
  IconMaximize,
  IconMinimize,
  IconPause,
  IconPlay,
  IconRewind,
  IconSettings,
  IconVolume,
  IconVolumeOff,
} from "./player-icons";
import { formatPlayerTime } from "./format";
import { usePlayerControlPreset } from "./use-control-preset";

export type PlayerControlsProps = {
  buffered: number;
  desktopPreset: PlayerControlsLayoutPreset;
  mobilePreset: PlayerControlsLayoutPreset;
  onControlsInteraction?: () => void;
  onSettingsOpenChange?: (isOpen: boolean) => void;
  playbackRates: number[];
  player: Player | null;
  progress: number;
  seekRelative: (direction: -1 | 1) => void;
  state: PlayerSnapshot | null;
};

type InlineSettingsProps = {
  playbackRates: number[];
  player: Player | null;
  state: PlayerSnapshot | null;
};

export function PlayerControls({
  buffered,
  desktopPreset,
  mobilePreset,
  onControlsInteraction,
  onSettingsOpenChange,
  playbackRates,
  player,
  progress,
  seekRelative,
  state,
}: PlayerControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const activePreset = usePlayerControlPreset({
    autoHideDelay: 0,
    desktop: desktopPreset,
    mobile: mobilePreset,
  });

  return (
    <div
      className={["vhp-controls", activePreset.controlsClassName].join(" ")}
      data-vhp-controls
      onPointerEnter={onControlsInteraction}
    >
      <div className="vhp-progress">
        <div className="vhp-progress-track" aria-hidden="true">
          <div className="vhp-progress-loaded" style={{ inlineSize: `${buffered}%` }} />
          <div className="vhp-progress-played" style={{ inlineSize: `${progress}%` }} />
        </div>
        <input
          aria-label="Seek"
          type="range"
          min={0}
          max={state?.duration || 0}
          step="0.01"
          value={state?.currentTime || 0}
          onChange={(event) => player?.seek(Number(event.target.value))}
        />
      </div>

      <div className="vhp-control-row">
        <button
          type="button"
          className="vhp-icon-button vhp-main-action"
          aria-label={state?.isPlaying ? "Pause" : "Play"}
          onClick={() => void player?.togglePlay()}
        >
          {state?.isPlaying ? <IconPause /> : <IconPlay />}
        </button>

        <button
          type="button"
          className="vhp-icon-button"
          aria-label="Seek backward"
          onClick={() => seekRelative(-1)}
        >
          <IconRewind />
        </button>

        <button
          type="button"
          className="vhp-icon-button"
          aria-label="Seek forward"
          onClick={() => seekRelative(1)}
        >
          <IconForward />
        </button>

        <span className="vhp-time">
          {formatPlayerTime(state?.currentTime || 0)} / {formatPlayerTime(state?.duration || 0)}
        </span>

        {/* {activePreset.showLoadedText ? (
          <span className="vhp-loaded" title="Loaded stream">
            {Math.round(buffered)}% loaded
          </span>
        ) : null} */}

        <div className="vhp-spacer" />

        <label className="vhp-volume" aria-label="Volume">
          <button
            type="button"
            className="vhp-icon-button"
            aria-label={state?.isMuted ? "Unmute" : "Mute"}
            onClick={() => (state?.isMuted ? player?.unmute() : player?.mute())}
          >
            {state?.isMuted || state?.volume === 0 ? <IconVolumeOff /> : <IconVolume />}
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

        {activePreset.settingsMode === "inline" ? (
          <InlineSettings playbackRates={playbackRates} player={player} state={state} />
        ) : (
          <div className="vhp-settings">
            <button
              type="button"
              className="vhp-icon-button"
              aria-expanded={isSettingsOpen}
              aria-label="Settings"
              onClick={() => {
                setIsSettingsOpen((current) => {
                  onSettingsOpenChange?.(!current);
                  return !current;
                });
              }}
            >
              <IconSettings />
            </button>

            {isSettingsOpen ? (
              <div className="vhp-settings-menu">
                <InlineSettings playbackRates={playbackRates} player={player} state={state} />
              </div>
            ) : null}
          </div>
        )}

        <button
          type="button"
          className="vhp-icon-button"
          aria-label={state?.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={() => void player?.toggleFullscreen()}
        >
          {state?.isFullscreen ? <IconMinimize /> : <IconMaximize />}
        </button>
      </div>
    </div>
  );
}

function InlineSettings({ playbackRates, player, state }: InlineSettingsProps) {
  return (
    <>
      <label className="vhp-select-label">
        <span>Speed</span>
        <select
          aria-label="Playback speed"
          value={state?.playbackRate || 1}
          onChange={(event) => player?.setPlaybackRate(Number(event.target.value))}
        >
          {playbackRates.map((rate) => (
            <option key={rate} value={rate}>
              {rate === 1 ? "Normal" : `${rate}x`}
            </option>
          ))}
        </select>
      </label>

      <label className="vhp-select-label">
        <span>Quality</span>
        <select
          aria-label="Quality"
          value={state?.selectedQuality ?? "auto"}
          onChange={(event) => {
            const value = event.target.value;
            player?.setQuality(value === "auto" ? "auto" : Number(value));
          }}
        >
          <option value="auto">Auto</option>
          {state?.qualities.map((quality) => (
            <option key={quality.id} value={quality.id}>
              {quality.label}
              {state.activeQuality === quality.id ? " playing" : ""}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

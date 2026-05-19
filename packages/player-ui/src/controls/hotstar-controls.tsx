import { useEffect, useRef, useState } from "react";
import type { Player, PlayerSnapshot } from "@varun/player-core";
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
} from "../player-icons";
import { formatPlayerTime } from "../format";

export type HotstarControlsProps = {
    buffered: number;
    isMobile: boolean;
    onControlsInteraction?: () => void;
    onSettingsOpenChange?: (isOpen: boolean) => void;
    playbackRates: number[];
    player: Player | null;
    progress: number;
    seekRelative: (direction: -1 | 1) => void;
    state: PlayerSnapshot | null;
};

type SettingsProps = {
    playbackRates: number[];
    player: Player | null;
    state: PlayerSnapshot | null;
};

export function HotstarControls({
    buffered,
    isMobile,
    onControlsInteraction,
    onSettingsOpenChange,
    playbackRates,
    player,
    progress,
    seekRelative,
    state,
}: HotstarControlsProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isSettingsOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
                onSettingsOpenChange?.(false);
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isSettingsOpen, onSettingsOpenChange]);

    const handleSettingsToggle = () => {
        setIsSettingsOpen((current) => {
            onSettingsOpenChange?.(!current);
            return !current;
        });
    };

    return (
        <div
            className={`vhp-controls vhp-controls-hotstar ${isMobile ? "vhp-controls-mobile-hotstar" : "vhp-controls-desktop-hotstar"}`}
            data-vhp-controls
            onPointerEnter={onControlsInteraction}
        >
            <div className="vhp-progress vhp-progress-hotstar">
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

            <div className="vhp-control-row vhp-control-row-hotstar">
                <button
                    type="button"
                    className="vhp-icon-button vhp-icon-button-hotstar vhp-main-action"
                    aria-label={state?.isPlaying ? "Pause" : "Play"}
                    onClick={() => void player?.togglePlay()}
                >
                    {state?.isPlaying ? <IconPause /> : <IconPlay />}
                </button>

                {!isMobile && (
                    <>
                        <button
                            type="button"
                            className="vhp-icon-button vhp-icon-button-hotstar"
                            aria-label="Seek backward"
                            onClick={() => seekRelative(-1)}
                        >
                            <IconRewind />
                        </button>

                        <button
                            type="button"
                            className="vhp-icon-button vhp-icon-button-hotstar"
                            aria-label="Seek forward"
                            onClick={() => seekRelative(1)}
                        >
                            <IconForward />
                        </button>
                    </>
                )}

                {!isMobile && (
                    <label className="vhp-volume vhp-volume-hotstar" aria-label="Volume">
                        <button
                            type="button"
                            className="vhp-icon-button vhp-icon-button-hotstar"
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
                )}

                <span className="vhp-time vhp-time-hotstar">
                    {formatPlayerTime(state?.currentTime || 0)} / {formatPlayerTime(state?.duration || 0)}
                </span>

                <div className="vhp-spacer" />

                {!isMobile && (
                    <div className="vhp-settings vhp-settings-hotstar" ref={settingsRef}>
                        <button
                            type="button"
                            className="vhp-icon-button vhp-icon-button-hotstar"
                            aria-expanded={isSettingsOpen}
                            aria-label="Settings"
                            onClick={handleSettingsToggle}
                        >
                            <IconSettings />
                        </button>

                        {isSettingsOpen && (
                            <div className="vhp-settings-menu vhp-settings-menu-hotstar">
                                <Settings playbackRates={playbackRates} player={player} state={state} />
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className="vhp-icon-button vhp-icon-button-hotstar"
                    aria-label={state?.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    onClick={() => void player?.toggleFullscreen()}
                >
                    {state?.isFullscreen ? <IconMinimize /> : <IconMaximize />}
                </button>
            </div>
        </div>
    );
}

function Settings({ playbackRates, player, state }: SettingsProps) {
    return (
        <>
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
                            {state.activeQuality === quality.id ? " ●" : ""}
                        </option>
                    ))}
                </select>
            </label>

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
        </>
    );
}